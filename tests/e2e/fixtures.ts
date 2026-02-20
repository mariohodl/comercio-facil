import { test as base } from '@playwright/test';
import { AuthPage } from './pages/auth.page';
import { CompanySetupPage } from './pages/company-setup.page';
import { OnboardingPage } from './pages/onboarding.page';
import { ProductPage } from './pages/product.page';

type MyFixtures = {
    authPage: AuthPage;
    companySetupPage: CompanySetupPage;
    onboardingPage: OnboardingPage;
    productPage: ProductPage;
};

export const test = base.extend<MyFixtures>({
    authPage: async ({ page }, use) => {
        await use(new AuthPage(page));
    },
    companySetupPage: async ({ page }, use) => {
        await use(new CompanySetupPage(page));
    },
    onboardingPage: async ({ page }, use) => {
        await use(new OnboardingPage(page));
    },
    productPage: async ({ page }, use) => {
        await use(new ProductPage(page));
    },
});

export { expect } from '@playwright/test';
