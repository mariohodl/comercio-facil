import { Page, Locator, expect } from '@playwright/test';

export class AuthPage {
    readonly page: Page;

    // Sign Up Locators
    readonly signUpNameInput: Locator;
    readonly signUpEmailInput: Locator;
    readonly signUpPhoneInput: Locator;
    readonly signUpPasswordInput: Locator;
    readonly signUpConfirmPasswordInput: Locator;
    readonly signUpSubmitButton: Locator;

    // Sign In Locators
    readonly signInEmailInput: Locator;
    readonly signInPasswordInput: Locator;
    readonly signInSubmitButton: Locator;

    // Forgot Password Locators
    readonly forgotPasswordEmailInput: Locator;
    readonly forgotPasswordSubmitButton: Locator;

    // Reset Password Locators
    readonly resetPasswordNewInput: Locator;
    readonly resetPasswordConfirmInput: Locator;
    readonly resetPasswordSubmitButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Sign Up
        this.signUpNameInput = page.getByTestId('sign-up-name-input');
        this.signUpEmailInput = page.getByTestId('sign-up-email-input');
        this.signUpPhoneInput = page.getByTestId('sign-up-phone-input');
        this.signUpPasswordInput = page.getByTestId('sign-up-password-input');
        this.signUpConfirmPasswordInput = page.getByTestId('sign-up-confirm-password-input');
        this.signUpSubmitButton = page.getByTestId('sign-up-submit-button');

        // Sign In
        this.signInEmailInput = page.getByTestId('sign-in-email-input');
        this.signInPasswordInput = page.getByTestId('sign-in-password-input');
        this.signInSubmitButton = page.getByTestId('sign-in-submit-button');

        // Forgot Password
        this.forgotPasswordEmailInput = page.getByTestId('forgot-password-email-input');
        this.forgotPasswordSubmitButton = page.getByTestId('forgot-password-submit-button');

        // Reset Password
        this.resetPasswordNewInput = page.getByTestId('reset-password-new-password-input');
        this.resetPasswordConfirmInput = page.getByTestId('reset-password-confirm-password-input');
        this.resetPasswordSubmitButton = page.getByTestId('reset-password-submit-button');
    }

    // --- Actions ---

    async gotoSignUp() {
        await this.page.goto('/sign-up', { waitUntil: 'networkidle' });
    }

    async signUp(user: { name: string, email: string, phone: string, password: string }) {
        await this.signUpNameInput.fill(user.name);
        await this.signUpEmailInput.fill(user.email);
        await this.signUpPhoneInput.fill(user.phone);
        await this.signUpPasswordInput.fill(user.password);
        await this.signUpConfirmPasswordInput.fill(user.password);
        await this.signUpSubmitButton.click();
    }

    async gotoSignIn() {
        await this.page.goto('/sign-in', { waitUntil: 'networkidle' });
    }

    /**
     * Select "Dueño / Administrador" on the role selection screen.
     * This is required before the email/password form becomes visible.
     */
    async selectAdminRole() {
        const adminButton = this.page.getByRole('button', { name: /Dueño.*Administrador/i });
        await adminButton.click();
        // Wait for the credentials form to appear
        await this.signInEmailInput.waitFor({ state: 'visible', timeout: 10000 });
    }

    async signIn(credentials: { email: string, password: string }) {
        // Handle role selection screen if visible
        const adminButton = this.page.getByRole('button', { name: /Dueño.*Administrador/i });
        if (await adminButton.isVisible({ timeout: 1500 }).catch(() => false)) {
            await adminButton.click();
            await this.signInEmailInput.waitFor({ state: 'visible', timeout: 10000 });
        }
        await this.signInEmailInput.fill(credentials.email);
        await this.signInPasswordInput.fill(credentials.password);
        await this.signInSubmitButton.click();
    }

    async gotoForgotPassword() {
        await this.page.goto('/forgot-password', { waitUntil: 'networkidle' });
    }

    async requestPasswordReset(email: string) {
        await this.forgotPasswordEmailInput.fill(email);
        await this.forgotPasswordSubmitButton.click();
    }

    async resetPassword(newPassword: string) {
        await this.resetPasswordNewInput.fill(newPassword);
        await this.resetPasswordConfirmInput.fill(newPassword);
        await this.resetPasswordSubmitButton.click();
    }
}
