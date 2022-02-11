describe("Map component", () => {
    beforeEach(() => {
        cy.visit("/");
        cy.wait(5000);
    });

    it("Should hide pie charts", () => {
        cy.get("body").type("s");
        cy.get('[title="Hide addons [A]"]').click();
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody()
            .find("[id='Pie chart-switch']")
            .click({ force: true });
        cy.wait(2000);
        cy.matchImageSnapshot();
    });

    it("Should hide color legends", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody().find('[id="Wells-switch"]').click({ force: true });
        cy.wait(2000);
        cy.matchImageSnapshot();
    });

    it("Should hide faults", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody()
            .find('[id="Fault polygons-switch"]')
            .click({ force: true });
        cy.wait(2000);
        cy.matchImageSnapshot();
    });
});
