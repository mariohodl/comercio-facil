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
        await this.industrySelect.selectOption(data.industry);
        await this.submitButton.click();
    }
}
