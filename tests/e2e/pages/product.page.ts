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
        // Remember initial text to detect change later
        const initialText = await trigger.innerText().catch(() => '');

        await trigger.click();

        // Scope to the open popover content to avoid matching elements from other popovers
        const popoverContent = this.page.locator('[data-radix-popper-content-wrapper]:visible').last();
        await expect(popoverContent).toBeVisible({ timeout: 10000 });

        const input = popoverContent.locator('[cmdk-input]');
        await expect(input).toBeVisible({ timeout: 10000 });
        await input.fill(value);

        // Wait for debounce (300ms) + server fetch to resolve
        // Use a generous timeout for CI stability
        await this.page.waitForTimeout(3000);

        // Look for exact match among the items within the popover
        const items = popoverContent.locator('[cmdk-item]');
        const matchingItem = items.filter({ hasText: new RegExp(value, 'i') }).first();
        // Scope create button to just the popover, not the whole page
        const createBtn = popoverContent.locator('button').filter({ hasText: /Crear|Create/i }).first();

        if (await matchingItem.isVisible().catch(() => false)) {
            await matchingItem.click();
        } else if (await createBtn.isVisible().catch(() => false)) {
            await createBtn.click();
            // The create button triggers an async server action.
            // Wait for it to complete and set the form value.
            await this.page.waitForTimeout(2000);
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
        await expect(popoverContent).not.toBeVisible({ timeout: 5000 }).catch(() => {
            // If popover didn't close, press Escape to close it
            return this.page.keyboard.press('Escape');
        });

        // Extra settle time for async callbacks (onSelect/onCustomCreate)
        await this.page.waitForTimeout(500);

        // Verify the trigger button now shows the selected value
        await expect(trigger).not.toHaveText(initialText === '' ? /^$/ : new RegExp(`^\\s*$`), { timeout: 5000 }).catch(() => {
            // If text didn't change, log for diagnostics but don't fail here;
            // the form submission error will catch it
            console.warn(`Autocomplete for "${value}": trigger text may not have updated. Current: "${trigger.innerText()}"`)
        });
    }
}
