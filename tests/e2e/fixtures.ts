import { test as base } from '@playwright/test';
import { AuthPage } from './pages/auth.page';
import { CompanySetupPage } from './pages/company-setup.page';

type MyFixtures = {
    authPage: AuthPage;
    companySetupPage: CompanySetupPage;
};

export const test = base.extend<MyFixtures>({
    authPage: async ({ page }, use) => {
        await use(new AuthPage(page));
    },
    companySetupPage: async ({ page }, use) => {
        await use(new CompanySetupPage(page));
    },
});

export { expect } from '@playwright/test';
