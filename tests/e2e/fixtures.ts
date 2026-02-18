import { test as base } from '@playwright/test';
import { AuthPage } from './pages/auth.page';

type AppFixtures = {
    authPage: AuthPage;
    //Reminder for later: add other page objects here as the project grows
    // dashboardPage: DashboardPage;
    // productPage: ProductPage;
};

export const test = base.extend<AppFixtures>({
    authPage: async ({ page }, use) => {
        const authPage = new AuthPage(page);
        await use(authPage);
    },
});

export { expect } from '@playwright/test';
