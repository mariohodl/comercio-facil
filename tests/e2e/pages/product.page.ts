import { expect, type Locator, type Page } from '@playwright/test';

export class ProductPage {
    readonly page: Page;
    readonly nameInput: Locator;
    readonly barcodeInput: Locator;
    readonly categorySelect: Locator;
    readonly subCategorySelect: Locator;
    readonly brandSelect: Locator;
    readonly unitSelect: Locator;
    readonly warehouseSelect: Locator;
    readonly costInput: Locator;
    readonly priceInput: Locator;
    readonly stockInput: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nameInput = page.getByTestId('product-name-input');
        this.barcodeInput = page.getByTestId('product-barcode-input');
        this.categorySelect = page.getByTestId('product-category-select');
        this.subCategorySelect = page.getByTestId('product-subcategory-select');
        this.brandSelect = page.getByTestId('product-brand-select');
        this.unitSelect = page.getByTestId('product-unit-select');
        this.warehouseSelect = page.getByTestId('product-warehouse-select');
        this.costInput = page.getByTestId('product-cost-input');
        this.priceInput = page.getByTestId('product-price-input');
        this.stockInput = page.getByTestId('product-stock-input');
        this.submitButton = page.getByTestId('product-submit-button');
    }

    async createProduct(data: {
        name: string,
        barcode: string,
        category: string,
        subCategory: string,
        brand: string,
        unit: string,
        cost: string,
        price: string,
        stock: string,
    }) {
        await this.nameInput.fill(data.name);

        // Wait for slug to auto-generate (driven by a useEffect watching name)
        await this.page.waitForTimeout(500);

        await this.barcodeInput.fill(data.barcode);

        // Handle CatalogAutocomplete fields
        await this.selectFromAutocomplete(this.categorySelect, data.category);

        // Wait briefly for subCategory options to load (depends on selected category)
        await this.page.waitForTimeout(500);
        await this.selectFromAutocomplete(this.subCategorySelect, data.subCategory);

        await this.selectFromAutocomplete(this.brandSelect, data.brand);
        await this.selectFromAutocomplete(this.unitSelect, data.unit);

        await this.costInput.fill(data.cost);
        await this.priceInput.fill(data.price);
        await this.stockInput.fill(data.stock);

        // Wait for auto-publish useEffect to settle (it fires when all fields
        // are filled and triggers a re-render that can make the button briefly stale)
        await this.page.waitForTimeout(1500);

        await this.clickSubmit();
    }

    /**
     * Creates a product filling all fields EXCEPT the barcode.
     * Useful for testing barcode validation on Single Product type.
     */
    async createProductWithoutBarcode(data: {
        name: string,
        category: string,
        subCategory: string,
        brand: string,
        unit: string,
        cost: string,
        price: string,
        stock: string,
    }) {
        await this.nameInput.fill(data.name);
        await this.page.waitForTimeout(500);

        // Skip barcode intentionally

        await this.selectFromAutocomplete(this.categorySelect, data.category);
        await this.page.waitForTimeout(500);
        await this.selectFromAutocomplete(this.subCategorySelect, data.subCategory);
        await this.selectFromAutocomplete(this.brandSelect, data.brand);
        await this.selectFromAutocomplete(this.unitSelect, data.unit);

        await this.costInput.fill(data.cost);
        await this.priceInput.fill(data.price);
        await this.stockInput.fill(data.stock);

        await this.page.waitForTimeout(1500);
        await this.clickSubmit();
    }

    /**
     * Edits specific fields on an existing product form and submits.
     * Only updates the fields provided in the data object.
     */
    async editProduct(data: {
        name?: string,
        cost?: string,
        price?: string,
        stock?: string,
    }) {
        if (data.name !== undefined) {
            await this.nameInput.clear();
            await this.nameInput.fill(data.name);
            await this.page.waitForTimeout(500);
        }
        if (data.cost !== undefined) {
            await this.costInput.clear();
            await this.costInput.fill(data.cost);
        }
        if (data.price !== undefined) {
            await this.priceInput.clear();
            await this.priceInput.fill(data.price);
        }
        if (data.stock !== undefined) {
            await this.stockInput.clear();
            await this.stockInput.fill(data.stock);
        }

        await this.page.waitForTimeout(1000);
        await this.clickSubmit();
    }

    /**
     * Scrolls to the submit button, ensures it's enabled, and clicks it.
     * Uses force:true to bypass any overlay from GuidedHighlighter.
     */
    private async clickSubmit() {
        await this.submitButton.scrollIntoViewIfNeeded();
        await expect(this.submitButton).toBeEnabled({ timeout: 5000 });
        await this.submitButton.click({ force: true });
    }

    /**
     * Selects an option from a CatalogAutocomplete (cmdk-based) popover.
     * If the exact option is not found, it falls back to clicking the "Create" button.
     */
    private async selectFromAutocomplete(trigger: Locator, value: string) {
        await trigger.click();

        const input = this.page.locator('[cmdk-input]').first();
        await expect(input).toBeVisible({ timeout: 10000 });
        await input.fill(value);

        // Wait for debounce + server fetch to resolve
        await this.page.waitForTimeout(1500);

        // Look for exact match among the items
        const items = this.page.locator('[cmdk-item]');
        const matchingItem = items.filter({ hasText: new RegExp(value, 'i') }).first();
        const createBtn = this.page.locator('button').filter({ hasText: /Crear|Create/i }).first();

        if (await matchingItem.isVisible().catch(() => false)) {
            await matchingItem.click();
        } else if (await createBtn.isVisible().catch(() => false)) {
            await createBtn.click();
        } else {
            // Last resort: click the first available item
            const firstItem = items.first();
            if (await firstItem.isVisible().catch(() => false)) {
                await firstItem.click();
            } else {
                throw new Error(`Autocomplete: no option or create button found for "${value}"`);
            }
        }

        // Wait for popover to close
        await this.page.waitForTimeout(300);
    }
}
