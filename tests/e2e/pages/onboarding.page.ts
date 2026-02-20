import { expect, type Locator, type Page } from '@playwright/test';

export class OnboardingPage {
    readonly page: Page;
    readonly checklistContainer: Locator;
    readonly completionCard: Locator;

    constructor(page: Page) {
        this.page = page;
        this.checklistContainer = page.locator('.getting-started-checklist'); // assuming it has this class or similar
        this.completionCard = page.getByTestId('onboarding-completion-card');
    }

    getStepCard(stepId: string) {
        return this.page.getByTestId(`onboarding-step-${stepId}`);
    }

    getStepButton(stepId: string) {
        return this.page.getByTestId(`onboarding-step-button-${stepId}`);
    }

    async goto(storeId: string) {
        await this.page.goto(`/admin/${storeId}/overview`);
    }
}
