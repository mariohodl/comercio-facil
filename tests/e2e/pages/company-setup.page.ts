import { Locator, Page } from '@playwright/test';

export class CompanySetupPage {
    readonly page: Page;
    readonly companyNameInput: Locator;
    readonly storeNameInput: Locator;
    readonly storeLocationInput: Locator;
    readonly warehouseNameInput: Locator;
    readonly warehouseLocationInput: Locator;
    readonly industrySelect: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.companyNameInput = page.getByTestId('setup-company-name-input');
        this.storeNameInput = page.getByTestId('setup-store-name-input');
        this.storeLocationInput = page.getByTestId('setup-store-location-input');
        this.warehouseNameInput = page.getByTestId('setup-warehouse-name-input');
        this.warehouseLocationInput = page.getByTestId('setup-warehouse-location-input');
        this.industrySelect = page.getByTestId('setup-industry-select');
        this.submitButton = page.getByTestId('setup-submit-button');
    }

    async setupCompany(data: {
        companyName: string,
        storeName: string,
        storeLocation: string,
        warehouseName: string,
        warehouseLocation: string,
        industry: string
    }) {
        await this.companyNameInput.fill(data.companyName);
        await this.storeNameInput.fill(data.storeName);
        // await this.storeLocationInput.fill(data.storeLocation);
        await this.warehouseNameInput.fill(data.warehouseName);
        // await this.warehouseLocationInput.fill(data.warehouseLocation);

        // IndustryAutocomplete is a custom portal-based combobox, not a native <select>.
        // Click the trigger button to open the dropdown, then select the matching option.
        const industryTrigger = this.industrySelect.getByRole('button');
        await industryTrigger.click();
        // Wait for the portal dropdown to appear and click the matching option
        const dropdown = this.page.locator('#industry-ac-portal');
        await dropdown.waitFor({ state: 'visible', timeout: 5000 });
        // Click the option that matches the industry value (by text)
        // The options contain industry names like "Abarrotes", "General", etc.
        // data.industry is the slug (e.g. 'abarrotes'), so match case-insensitively
        await dropdown.locator('button').filter({ hasText: new RegExp(data.industry, 'i') }).first().click();

        await this.submitButton.click();
    }
}
