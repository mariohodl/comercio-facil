import { test, expect } from './fixtures';
import { MongoClient } from 'mongodb';

test.describe('Product Management', () => {
    test.describe.configure({ mode: 'serial' });

    let client: MongoClient;
    const testEmail = `product-test-${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    let storeId: string;

    test.beforeAll(async () => {
        client = new MongoClient(process.env.MONGODB_URI!);
        await client.connect();
    });

    test.afterAll(async () => {

        const db = client.db();
        const user = await db.collection('users').findOne({ email: testEmail });
        if (user) {
            const companyId = user.business?.companyId;
            await db.collection('products').deleteMany({ store: storeId });
            await db.collection('warehouses').deleteMany({ company: companyId });
            await db.collection('stores').deleteMany({ company: companyId });
            await db.collection('companies').deleteOne({ _id: companyId });
            await db.collection('users').deleteOne({ email: testEmail });
        }
        await client.close();
    });

    // Shared setup: sign up, verify, sign in, company setup
    async function setupUser(page: any, authPage: any, companySetupPage: any) {
        await page.goto('/sign-up');
        await authPage.signUp({
            name: 'Product Tester',
            email: testEmail,
            phone: '1112223333',
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

        await expect(page.getByTestId('setup-company-name-input')).toBeVisible({ timeout: 30000 });
        await companySetupPage.setupCompany({
            companyName: 'Product Corp',
            storeName: 'Product Store',
            storeLocation: 'Test Location',
            warehouseName: 'Product Warehouse',
            warehouseLocation: 'Test WH Location',
            industry: 'general'
        });

        await expect(page).toHaveURL(/.*\/admin\/.*\/overview/, { timeout: 30000 });

        // Dismiss onboarding modal if it appears (check immediately)
        const getStartedButton = page.getByRole('button', { name: /Comenzar/i });
        if (await getStartedButton.isVisible()) {
            await getStartedButton.click();
        }

        storeId = page.url().split('/')[4];
    }

    // Helper: sign in with existing user (no sign-up/company setup)
    async function signIn(page: any, authPage: any) {
        await page.goto('/sign-in');
        await authPage.signIn({
            email: testEmail,
            password: testPassword,
        });
        await expect(page).toHaveURL(/.*\/admin\/.*\/overview/, { timeout: 30000 });

        // Dismiss onboarding modal if it appears (check immediately)
        const getStartedButton = page.getByRole('button', { name: /Comenzar/i });
        if (await getStartedButton.isVisible()) {
            await getStartedButton.click();
        }
    }

    test('should create a product and verify it appears in the product list', async ({ page, authPage, companySetupPage, productPage }) => {
        test.setTimeout(180000);

        await setupUser(page, authPage, companySetupPage);
        await page.goto(`/admin/${storeId}/products/create`);
        await expect(page.getByTestId('product-name-input')).toBeVisible({ timeout: 15000 });

        // IMPORTANT Note: Image upload is intentionally not tested here. It relies on UploadThing
        // (external service), images are optional for product creation, and adding them
        // would make this test slower and flaky. Image logic can be covered separately

        await productPage.createProduct({
            name: 'Test Product',
            barcode: '1234567890123',
            category: 'Materiales',
            subCategory: 'Cemento',
            brand: 'Generico',
            unit: 'Pieza',
            cost: '10.50',
            price: '20.00',
            stock: '100'
        });

        // The form's onSubmit shows a loading toast immediately. If we don't see it,
        // the click might have been lost due to a re-render.
        const toasts = page.locator('[data-sonner-toaster] [data-sonner-toast]');
        const submitted = await toasts.first().isVisible({ timeout: 5000 }).catch(() => false);

        if (!submitted) {
            // Retry: scroll to button and click again
            const submitBtn = page.getByTestId('product-submit-button');
            await submitBtn.scrollIntoViewIfNeeded();
            await submitBtn.click({ force: true });
        }

        // Diagnostic: Check if an error toast appears (like validation or server error)
        // If an error appears, we want to know it rather than just timing out on the URL check.
        const errorToast = toasts.filter({ hasText: /error|revisar|revisa|check|already exists|ya existe/i });
        if (await errorToast.isVisible({ timeout: 5000 }).catch(() => false)) {
            const errorMsg = await errorToast.innerText();
            throw new Error(`Product creation failed with error toast: "${errorMsg}"`);
        }

        // Verify redirect to product list after successful creation
        await expect(page).toHaveURL(/.*\/admin\/.*\/products$/, { timeout: 60000 });
        await expect(page.getByText(/lista de productos|product list/i)).toBeVisible({ timeout: 20000 });

        // Verify the product row shows correct data in the table
        // Wait for the table to load data first
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 20000 });
        const productRow = page.locator('table tbody tr').filter({ hasText: 'Test Product' });
        await expect(productRow).toBeVisible({ timeout: 15000 });
        await expect(productRow).toContainText('Materiales');
        await expect(productRow).toContainText('Generico');
        await expect(productRow).toContainText('100');

        // Product is auto-published when all fields (price, cost, stock, barcode) are filled
        await expect(productRow.getByText(/activo|active/i)).toBeVisible();
    });

    test('should show validation errors when required fields are empty', async ({ page, authPage }) => {
        test.setTimeout(60000);

        await signIn(page, authPage);
        await page.goto(`/admin/${storeId}/products/create`);
        await expect(page.getByTestId('product-name-input')).toBeVisible({ timeout: 15000 });

        // Try to submit the form without filling anything
        await page.getByTestId('product-submit-button').click();

        // Should stay on the create page (no redirect)
        await expect(page).toHaveURL(/.*\/products\/create/);

        // Should show validation messages for required fields
        // Name requires min 3 chars, category/brand/unit/subCategory are required
        await expect(page.getByText(/al menos 3 caracteres|at least 3 characters/i).first()).toBeVisible({ timeout: 5000 });
    });

    test('should reject duplicate barcode', async ({ page, authPage, productPage }) => {
        test.setTimeout(120000);

        await signIn(page, authPage);
        await page.goto(`/admin/${storeId}/products/create`);
        await expect(page.getByTestId('product-name-input')).toBeVisible({ timeout: 15000 });

        // Try to create a second product with the same barcode as the first test
        await productPage.createProduct({
            name: 'Duplicate Barcode Product',
            barcode: '1234567890123', // Same barcode as "Test Product"
            category: 'Materiales',
            subCategory: 'Cemento',
            brand: 'Generico',
            unit: 'Pieza',
            cost: '5.00',
            price: '10.00',
            stock: '50'
        });

        // Should stay on the create page and show a duplicate barcode error (via toast)
        await expect(page).toHaveURL(/.*\/products\/create/, { timeout: 15000 });
        // The error is shown via sonner toast: "Este código de barras ya está registrado en esta tienda por otro producto."
        // Sonner renders toasts in <li> elements inside an <ol> with [data-sonner-toaster]
        await expect(
            page.locator('[data-sonner-toaster] [data-sonner-toast]').filter({ hasText: /ya está registrado|already registered/i }).first()
        ).toBeVisible({ timeout: 30000 });
    });

    test('should create a draft product with $0 price', async ({ page, authPage, productPage }) => {
        test.setTimeout(120000);

        await signIn(page, authPage);
        await page.goto(`/admin/${storeId}/products/create`);
        await expect(page.getByTestId('product-name-input')).toBeVisible({ timeout: 15000 });

        await productPage.createProduct({
            name: 'Draft Zero Price Product',
            barcode: '9999999999999',
            category: 'Materiales',
            subCategory: 'Cemento',
            brand: 'Generico',
            unit: 'Pieza',
            cost: '0',
            price: '0',
            stock: '0'
        });

        // Product with $0 price should still save (as draft/unpublished)
        await expect(page).toHaveURL(/.*\/admin\/.*\/products$/, { timeout: 45000 });
        await expect(page.getByText(/lista de productos|product list/i)).toBeVisible({ timeout: 15000 });

        // Verify the draft product appears in the table
        const productRow = page.locator('table tbody tr').filter({ hasText: 'Draft Zero Price Product' });
        await expect(productRow).toBeVisible({ timeout: 10000 });

        // Should be inactive since price is $0 (auto-publish requires price > 0)
        await expect(productRow.getByText(/inactivo|inactive/i)).toBeVisible();
    });

    test('should show barcode validation error when barcode is missing', async ({ page, authPage, productPage }) => {
        test.setTimeout(120000);

        await signIn(page, authPage);
        await page.goto(`/admin/${storeId}/products/create`);
        await expect(page.getByTestId('product-name-input')).toBeVisible({ timeout: 15000 });

        // Fill everything EXCEPT the barcode
        await productPage.createProductWithoutBarcode({
            name: 'No Barcode Product',
            category: 'Materiales',
            subCategory: 'Cemento',
            brand: 'Generico',
            unit: 'Pieza',
            cost: '10.00',
            price: '20.00',
            stock: '50'
        });

        // Should stay on the create page
        await expect(page).toHaveURL(/.*\/products\/create/);

        // Should show the barcode-specific validation message
        await expect(
            page.getByText(/código de barras.*obligatorio|barcode.*required/i).first()
        ).toBeVisible({ timeout: 5000 });
    });

    test('should edit an existing product and verify updated data', async ({ page, authPage, productPage }) => {
        test.setTimeout(120000);

        await signIn(page, authPage);

        // Navigate to the product list
        await page.goto(`/admin/${storeId}/products`);
        await expect(page.getByText(/lista de productos|product list/i)).toBeVisible({ timeout: 15000 });

        // Wait for product data to load in the table
        await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });

        // Find the "Test Product" row — exclude "Draft" rows to avoid matching "Draft Zero Price Product"
        const productRow = page.locator('table tbody tr').filter({ hasText: 'Test Product' }).filter({ hasNotText: 'Draft' }).first();
        await expect(productRow).toBeVisible({ timeout: 10000 });

        // Click the edit link (2nd link in the actions cell: [0]=details, [1]=edit)
        const editLink = productRow.locator('td').last().locator('a').nth(1);
        await editLink.click();

        // Wait for the edit form to load
        await expect(page.getByTestId('product-name-input')).toBeVisible({ timeout: 15000 });

        await productPage.editProduct({
            name: 'Test Product Updated',
            price: '25.00',
        });

        // Should redirect back to the product list
        await expect(page).toHaveURL(/.*\/admin\/.*\/products$/, { timeout: 45000 });
        await expect(page.getByText(/lista de productos|product list/i)).toBeVisible({ timeout: 15000 });

        // Verify the updated product row
        const updatedRow = page.locator('table tbody tr').filter({ hasText: 'Test Product Updated' });
        await expect(updatedRow).toBeVisible({ timeout: 10000 });
    });
});
