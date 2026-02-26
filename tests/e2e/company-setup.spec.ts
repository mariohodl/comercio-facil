import { test, expect } from './fixtures';
import { MongoClient } from 'mongodb';

test.describe('Company Setup Flow', () => {
    let client: MongoClient;
    const testEmail = `company-test-${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    test.beforeAll(async () => {
        client = new MongoClient(process.env.MONGODB_URI!);
        await client.connect();
    });

    test.afterAll(async () => {
        const db = client.db();
        // Cleanup test user, company, and related entities
        const user = await db.collection('users').findOne({ email: testEmail });
        if (user) {
            await db.collection('companies').deleteMany({ owner: user._id });
            await db.collection('users').deleteOne({ email: testEmail });
            // Cleanup stores and warehouses if any
            await db.collection('stores').deleteMany({ owner: user._id });
            await db.collection('warehouses').deleteMany({ owner: user._id });
        }
        await client.close();
    });

    test('New user is forced to setup company and can complete it', async ({ page, authPage, companySetupPage }) => {
        await page.goto('/sign-up');
        await authPage.signUp({
            name: 'Test Owner',
            email: testEmail,
            phone: '1234567890',
            password: testPassword,
        });

        // Should be at verify-email page
        await expect(page).toHaveURL(/.*verify-email.*/);

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

        await expect(page).toHaveURL(/.*\/admin\/.*/);

        const modalTitle = page.locator('[role="dialog"] h2');
        await expect(modalTitle).toBeVisible({ timeout: 20000 });
        const titleText = await modalTitle.innerText();
        expect(titleText.length).toBeGreaterThan(0);

        await companySetupPage.setupCompany({
            companyName: 'Test Company INC',
            storeName: 'Main Branch',
            storeLocation: 'City Center 123',
            warehouseName: 'Main Warehouse',
            warehouseLocation: 'Logistics Park A',
            industry: 'abarrotes'
        });

        await expect(page).toHaveURL(/.*\/admin\/.*\/overview/, { timeout: 30000 });
        await expect(page.getByText('Test Company INC')).toBeVisible();
    });
});
