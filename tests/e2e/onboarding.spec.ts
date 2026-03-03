import { test, expect } from './fixtures';
import { MongoClient } from 'mongodb';

test.describe('Onboarding Checklist', () => {
    let client: MongoClient;
    const testEmail = `onboarding-test-${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    test.beforeAll(async () => {
        client = new MongoClient(process.env.MONGODB_URI!);
        await client.connect();
    });

    test.afterAll(async () => {
        const db = client.db();
        const user = await db.collection('users').findOne({ email: testEmail });
        if (user) {
            await db.collection('companies').deleteMany({ owner: user._id });
            await db.collection('users').deleteOne({ email: testEmail });
            await db.collection('stores').deleteMany({ owner: user._id });
            await db.collection('warehouses').deleteMany({ owner: user._id });
        }
        await client.close();
    });

    test('should show onboarding checklist after company setup', async ({ page, authPage, companySetupPage, onboardingPage }) => {
        test.setTimeout(120000); // 2 minutes
        await page.goto('/sign-up');
        await authPage.signUp({
            name: 'Onboarding Tester',
            email: testEmail,
            phone: '0987654321',
            password: testPassword,
        });

        await expect(page).toHaveURL(/.*verify-email.*/, { timeout: 15000 });

        const db = client.db();
        await db.collection('users').updateOne(
            { email: testEmail },
            { $set: { emailVerified: true } }
        );

        await page.goto('/sign-in');
        await authPage.signIn({
            email: testEmail,
            password: testPassword,
        });

        // Wait for the modal or the setup page to be ready
        await expect(page.getByTestId('setup-company-name-input')).toBeVisible({ timeout: 30000 });

        await companySetupPage.setupCompany({
            companyName: 'Onboarding Corp',
            storeName: 'Onboarding Store',
            storeLocation: 'Test Location',
            warehouseName: 'Test Warehouse',
            warehouseLocation: 'Test WH Location',
            industry: 'abarrotes'
        });

        // The URL should eventually contain /overview
        // The session update might take a second to propagate to the middleware
        try {
            await expect(page).toHaveURL(/.*\/admin\/.*\/overview/, { timeout: 15000 });
        } catch (e) {
            if (page.url().includes('/admin/setup')) {
                await page.reload();
                await expect(page).toHaveURL(/.*\/admin\/.*\/overview/, { timeout: 15000 });
            } else {
                throw e;
            }
        }

        // Dismiss onboarding modal if it appears
        // The modal might take a second to animate in
        const getStartedButton = page.getByRole('button', { name: /Comenzar/i });
        try {
            await getStartedButton.waitFor({ state: 'visible', timeout: 5000 });
            await getStartedButton.click();
        } catch (e) {
            // Modal might already be dismissed or didn't show up
            console.log('Onboarding modal not found or already dismissed');
        }

        // Assert checklist steps are visible
        const step1 = onboardingPage.getStepCard('products');
        const step2 = onboardingPage.getStepCard('purchases');
        const step3 = onboardingPage.getStepCard('sales');

        await expect(step1).toBeVisible();
        await expect(step2).toBeVisible();
        await expect(step3).toBeVisible();

        // Step 1 should be active (not completed)
        await expect(step1).toContainText('Crea tus productos');

        // Check first step button
        const step1Button = onboardingPage.getStepButton('products');
        await expect(step1Button).toBeVisible();
        await expect(step1Button).toBeEnabled();

        // Click step 1 button and verify navigation
        await step1Button.scrollIntoViewIfNeeded();
        await step1Button.click({ force: true });

        // Wait for URL to change (giving it a bit more time for slow dev server)
        await expect(page).toHaveURL(/.*\/admin\/.*\/products\/create/, { timeout: 30000 });
    });
});
