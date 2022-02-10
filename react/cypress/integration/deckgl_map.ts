/// <reference types="cypress" />

describe("DataRangePicker component", () => {
    beforeEach(() => {
        // visit DataRangePicker story in Storybook
        cy.visit("/");
        cy.wait(5000);
    });

    it("Should change values when user selects start and end date as a range", () => {
        // click to set start date
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody()
            .find("[id='Pie chart-switch']")
            .click({ force: true });
    });
});
