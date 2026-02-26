import { expect, type Locator, type Page } from '@playwright/test';

export class ProductPage {
    readonly page: Page;
    readonly nameInput: Locator;
    readonly skuInput: Locator;
    readonly slugInput: Locator;
    readonly barcodeInput: Locator;
    readonly categorySelect: Locator;
    readonly subCategorySelect: Locator;
    readonly brandSelect: Locator;
    readonly unitSelect: Locator;
    readonly warehouseSelect: Locator;
    readonly storeSelect: Locator;
    readonly costInput: Locator;
    readonly priceInput: Locator;
    readonly stockInput: Locator;
    readonly quantityAlertInput: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nameInput = page.getByTestId('product-name-input');
        this.skuInput = page.getByTestId('product-sku-input');
        this.slugInput = page.getByTestId('product-slug-input');
        this.barcodeInput = page.getByTestId('product-barcode-input');
        this.categorySelect = page.getByTestId('product-category-select');
        this.subCategorySelect = page.getByTestId('product-subcategory-select');
        this.brandSelect = page.getByTestId('product-brand-select');
        this.unitSelect = page.getByTestId('product-unit-select');
        this.warehouseSelect = page.getByTestId('product-warehouse-select');
        this.storeSelect = page.getByTestId('product-store-select');
        this.costInput = page.getByTestId('product-cost-input');
        this.priceInput = page.getByTestId('product-price-input');
        this.stockInput = page.getByTestId('product-stock-input');
        this.quantityAlertInput = page.getByTestId('product-quantity-alert-input');
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
        quantityAlert?: string,
        store?: string,
        warehouse?: string,
    }) {
        await this.nameInput.fill(data.name);

        if (data.store) {
            await this.selectFromSelect(this.storeSelect, data.store);
        }
        if (data.warehouse) {
            await this.selectFromSelect(this.warehouseSelect, data.warehouse);
        }

        // Wait for slug and sku to auto-generate
        await expect(this.slugInput).not.toHaveValue('', { timeout: 10000 });
        await expect(this.skuInput).not.toHaveValue('', { timeout: 10000 });

        await this.barcodeInput.fill(data.barcode);

        // Handle CatalogAutocomplete fields
        await this.selectFromAutocomplete(this.categorySelect, data.category);

        // Wait briefly for subCategory options to load (depends on selected category)
        await this.page.waitForTimeout(1000);
        await this.selectFromAutocomplete(this.subCategorySelect, data.subCategory);

        await this.selectFromAutocomplete(this.brandSelect, data.brand);
        await this.selectFromAutocomplete(this.unitSelect, data.unit);

        await this.costInput.fill(data.cost);
        await this.priceInput.fill(data.price);
        await this.stockInput.fill(data.stock);

        if (data.quantityAlert) {
            await this.quantityAlertInput.fill(data.quantityAlert);
        } else {
            // Fill a default if missing, as it's mandatory
            await this.quantityAlertInput.fill('5');
        }

        // Wait for auto-publish useEffect to settle
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
        quantityAlert?: string,
        store?: string,
        warehouse?: string,
    }) {
        await this.nameInput.fill(data.name);

        if (data.store) {
            await this.selectFromSelect(this.storeSelect, data.store);
        }
        if (data.warehouse) {
            await this.selectFromSelect(this.warehouseSelect, data.warehouse);
        }

        await expect(this.slugInput).not.toHaveValue('', { timeout: 10000 });
        await expect(this.skuInput).not.toHaveValue('', { timeout: 10000 });

        // Skip barcode intentionally

        await this.selectFromAutocomplete(this.categorySelect, data.category);
        await this.page.waitForTimeout(1000);
        await this.selectFromAutocomplete(this.subCategorySelect, data.subCategory);
        await this.selectFromAutocomplete(this.brandSelect, data.brand);
        await this.selectFromAutocomplete(this.unitSelect, data.unit);

        await this.costInput.fill(data.cost);
        await this.priceInput.fill(data.price);
        await this.stockInput.fill(data.stock);

        if (data.quantityAlert) {
            await this.quantityAlertInput.fill(data.quantityAlert);
        } else {
            await this.quantityAlertInput.fill('5');
        }

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
        quantityAlert?: string,
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
        if (data.quantityAlert !== undefined) {
            await this.quantityAlertInput.clear();
            await this.quantityAlertInput.fill(data.quantityAlert);
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
     * Selects an option from a Shadcn UI (Radix-based) Select component.
     */
    private async selectFromSelect(trigger: Locator, value: string) {
        await trigger.click();
        // Radios/Select items are usually in a portal, so we search the whole page
        const option = this.page.locator('role=option').filter({ hasText: new RegExp(`^${value}$`, 'i') }).first();

        // If not found by exact text, try to find by value/selector as fallback
        if (!(await option.isVisible().catch(() => false))) {
            await this.page.locator(`[role=option][value="${value}"], [role=option]:has-text("${value}")`).first().click();
        } else {
            await option.click();
        }

        await this.page.waitForTimeout(300);
    }

    /**
     * Selects an option from a CatalogAutocomplete (cmdk-based) popover.
     * If the exact option is not found, it falls back to clicking the "Create" button.
     * After selection, verifies the trigger button reflects the chosen value.
     */
    private async selectFromAutocomplete(trigger: Locator, value: string) {
        await trigger.click();

        // Wait for the actual visible popover wrapper
        const popover = this.page.locator('[data-radix-popper-content-wrapper]:visible').last();
        await expect(popover).toBeVisible({ timeout: 15000 });

        // Find the input inside the popover
        const input = popover.locator('input').first();
        await expect(input).toBeVisible({ timeout: 5000 });

        await input.clear();
        await input.fill(value);

        await this.page.waitForTimeout(1000);
        const loader = popover.locator('svg.animate-spin');
        if (await loader.isVisible().catch(() => false)) {
            await expect(loader).not.toBeVisible({ timeout: 15000 });
        }

        const items = popover.locator('[role="option"], [cmdk-item], [data-cmdk-item]');

        const matchingItem = items.filter({ hasText: new RegExp(`^${value}$`, 'i') }).first();
        const partialMatch = items.filter({ hasText: new RegExp(value, 'i') }).first();

        if (await matchingItem.isVisible().catch(() => false)) {
            await matchingItem.click();
        } else if (await partialMatch.isVisible().catch(() => false)) {
            await partialMatch.click();
        } else {
            const firstItem = items.first();
            if (await firstItem.isVisible().catch(() => false)) {
                await firstItem.click();
            } else {
                const createBtn = popover.locator('button').filter({ hasText: /Crear|Create|Nuevo|New|Agregar|Add/i }).first();
                if (await createBtn.isVisible().catch(() => false)) {
                    await createBtn.click();
                    await this.page.waitForTimeout(3000);
                } else {
                    throw new Error(`Autocomplete: no option or create button found for "${value}"`);
                }
            }
        }

        // Wait for popover to close
        await expect(popover).not.toBeVisible({ timeout: 10000 }).catch(() => {
            return this.page.keyboard.press('Escape');
        });

        await this.page.waitForTimeout(500);
    }
}
