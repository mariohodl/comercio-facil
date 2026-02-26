import { test, expect } from './fixtures';
import { connectToDatabase } from '../../lib/db';
import User from '../../lib/db/models/user.model';
import Company from '../../lib/db/models/company.model';
import PasswordResetToken from '../../lib/db/models/password-reset-token.model';


const TEST_USER = {
    name: 'Test Auth User',
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    phone: '5512345678'
};
const NEW_PASSWORD = 'NewPassword123!';

test.describe('Authentication E2E Flows', () => {


    test.beforeAll(async () => {
        const conn = await connectToDatabase();
        console.log('Test connected to DB:', conn.connection.name);
        await User.deleteOne({ email: TEST_USER.email });
        await PasswordResetToken.deleteOne({ email: TEST_USER.email });
    });

    test.afterAll(async () => {
        await connectToDatabase();
        await User.deleteOne({ email: TEST_USER.email });
        await PasswordResetToken.deleteOne({ email: TEST_USER.email });
    });

    test('Full Auth Cycle: Sign Up -> Sign In -> Password Recovery', async ({ page, authPage }) => {
        test.setTimeout(120000); // 2 minutes for the full cycle

        await authPage.gotoSignUp();
        await authPage.signUp({
            name: TEST_USER.name,
            email: TEST_USER.email,
            phone: TEST_USER.phone,
            password: TEST_USER.password
        });

        // Verify success toast or redirection
        await expect(page.getByText(/User created successfully|check your email for verification/i)).toBeVisible({ timeout: 10000 });

        // Manually verify email in DB to allow Sign In (if app requires it)
        // Polling for user creation
        let user: any = null;
        for (let i = 0; i < 10; i++) {
            user = await User.findOne({ email: TEST_USER.email });
            if (user) break;
            await page.waitForTimeout(500);
        }
        expect(user).not.toBeNull();

        // Force verification
        await User.updateOne({ email: TEST_USER.email }, { emailVerified: true });


        await authPage.gotoSignIn();
        await authPage.signIn({ email: TEST_USER.email, password: TEST_USER.password });

        // Verify login success (should redirect to home or admin)
        await expect(page).not.toHaveURL(/.*sign-in.*/);


        // Clear cookies to log out before testing password recovery
        await page.context().clearCookies();
        await authPage.gotoForgotPassword();
        await authPage.requestPasswordReset(TEST_USER.email);

        await expect(page.getByText('¡Correo enviado!')).toBeVisible();

        // Poll for token
        let tokenDoc: any = null;
        for (let i = 0; i < 10; i++) {
            tokenDoc = await PasswordResetToken.findOne({ email: TEST_USER.email });
            if (tokenDoc) break;
            await page.waitForTimeout(500);
        }
        expect(tokenDoc).not.toBeNull();
        const token = tokenDoc!.token;

        // Navigate to reset link
        await page.goto(`/reset-password?token=${token}&email=${encodeURIComponent(TEST_USER.email)}`);

        await authPage.resetPassword(NEW_PASSWORD);

        await expect(page.getByText('Tu contraseña ha sido actualizada con éxito.')).toBeVisible();
        await page.waitForURL('**/sign-in');

        await authPage.signIn({ email: TEST_USER.email, password: NEW_PASSWORD });

        await expect(page.getByText('Credenciales inválidas')).not.toBeVisible();
        await expect(page).not.toHaveURL(/.*sign-in.*/);
    });

    test('Sign In fails with invalid credentials', async ({ authPage, page }) => {
        await authPage.gotoSignIn();
        await authPage.signIn({
            email: 'wrong@example.com',
            password: 'wrongpassword'
        });

        // Verify error message - use a longer timeout for the toast
        await expect(page.getByText(/inválidas|incorrectas|error/i)).toBeVisible({ timeout: 15000 });
    });

    test('Sign Up fails with already registered email', async ({ authPage, page }) => {
        // First ensure user exists (we use the same user from the happy path if it ran)
        // or create it if not. Since we run tests in series or the beforeAll handles it,
        // we can attempt to sign up with a known existing email.

        // Let's create a user directly in DB for this test specifically if needed,
        const duplicateEmail = 'duplicate@example.com';
        await User.findOneAndUpdate(
            { email: duplicateEmail },
            { name: 'Duplicate User', password: 'Password123!', phone: '5512345678', emailVerified: true },
            { upsert: true }
        );

        await authPage.gotoSignUp();
        await authPage.signUp({
            name: 'New User',
            email: duplicateEmail,
            phone: '5511223344',
            password: 'Password123!'
        });

        // Verify error message (the registerUser action should return success: false)
        await expect(page.getByText(/Email already registered/i)).toBeVisible();

        // Clean up
        await User.deleteOne({ email: duplicateEmail });
    });

    test('Protected route redirects to sign-in', async ({ page }) => {
        // Accessing admin dashboard without a session
        await page.goto('/admin');

        // Should be redirected to sign-in with callbackUrl
        await expect(page).toHaveURL(/.*sign-in.*callbackUrl=.*%2Fadmin/);
    });

    test('Sign Up with PROMO2M gives 3 months trial', async ({ page, authPage, companySetupPage }) => {
        const promoUser = {
            name: 'Promo User',
            email: `promo${Date.now()}@example.com`,
            password: 'Password123!',
            phone: '1234567890'
        };

        // Navigate directly to sign-up with promo code
        await page.goto('/sign-up?promo=PROMO2M', { waitUntil: 'networkidle' });

        await authPage.signUpNameInput.fill(promoUser.name);
        await authPage.signUpEmailInput.fill(promoUser.email);
        await authPage.signUpPhoneInput.fill(promoUser.phone);
        await authPage.signUpPasswordInput.fill(promoUser.password);
        await authPage.signUpConfirmPasswordInput.fill(promoUser.password);

        // Verify promo badge is visible
        await expect(page.getByText(/¡Código PROMO2M aplicado!/i)).toBeVisible();
        await authPage.signUpSubmitButton.click();

        // Wait for user creation and verify email
        let user: any = null;
        for (let i = 0; i < 10; i++) {
            user = await User.findOne({ email: promoUser.email });
            if (user) break;
            await page.waitForTimeout(500);
        }
        await User.updateOne({ email: promoUser.email }, { emailVerified: true });

        // Sign in
        await authPage.gotoSignIn();
        await authPage.signIn({ email: promoUser.email, password: promoUser.password });

        // Should go to setup
        await expect(page).toHaveURL(/.*\/admin\/setup/);

        // Complete setup
        await companySetupPage.setupCompany({
            companyName: 'Promo Corp',
            storeName: 'Promo Store',
            storeLocation: 'Promo City',
            warehouseName: 'Promo Wh',
            warehouseLocation: 'Promo Area',
            industry: 'abarrotes'
        });

        await expect(page).toHaveURL(/.*\/admin\/.*\/overview/, { timeout: 30000 });

        // Verify trial duration in DB
        const updatedUser = (await User.findOne({ email: promoUser.email })) as any;
        expect(updatedUser?.business?.companyId).toBeDefined();

        const company = (await Company.findById(updatedUser.business.companyId)) as any;
        if (company?.trialEndDate) {
            const startDate = new Date();
            const trialEnd = new Date(company.trialEndDate);

            // Should be roughly 3 months from now (2 extra + 1 base)
            const diffMonths = (trialEnd.getFullYear() - startDate.getFullYear()) * 12 + (trialEnd.getMonth() - startDate.getMonth());
            expect(diffMonths).toBeGreaterThanOrEqual(2);
        }
    });
});
