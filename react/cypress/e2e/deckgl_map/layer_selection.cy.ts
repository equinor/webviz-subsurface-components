describe("Map component", () => {
    beforeEach(() => {
        cy.visit("/iframe.html?id=deckglmap--default&viewMode=story");
        cy.get("svg[role='progressbar']");
        cy.get("svg[role='progressbar']", {timeout:90000}).should("not.exist")
    });

    it("Should hide pie charts", () => {
        cy.get('[id="layers-selector-button"]').click({ waitForAnimations: false });
        cy.get("[id='Pie chart-switch']").click({ force: true });
        cy.wait(2000);
        cy.get('[id="layers-selector-button"]').click();
        cy.compareSnapshot("hide-pie-charts");
    });

    it("Should hide color legends", () => {
        cy.get('[id="layers-selector-button"]').click();
        cy.get('[id="Wells-switch"]').click({ force: true });
        cy.wait(2000);
        cy.get('[id="layers-selector-button"]').click();
        cy.compareSnapshot("hide-color-legends");
    });

    it("Should hide faults", () => {
        cy.get('[id="layers-selector-button"]').click();
        cy.get('[id="Fault polygons-switch"]').click({ force: true });
        cy.wait(2000);
        cy.get('[id="layers-selector-button"]').click();
        cy.compareSnapshot("hide-faults");
    });

    it("Should hide north arrow", () => {
        cy.get('[id="layers-selector-button"]').click();
        cy.get('[id="NorthArrow3D-switch-label"]').click({ force: true });
        cy.wait(1000);
        cy.get('[id="layers-selector-button"]').click();
        cy.compareSnapshot("hide-north-arrow");
    });

    it("Should hide hillshading layer", () => {
        cy.get('[id="layers-selector-button"]').click();
        cy.get('[id="Hill shading-switch-label"]').click({ force: true });
        cy.wait(1000);
        cy.get('[id="layers-selector-button"]').click();
        cy.compareSnapshot("hide-hill-shading");
    });

    it("Should hide property layer", () => {
        cy.get('[id="layers-selector-button"]').click();
        cy.get('[id="Property map-switch-label"]').click({ force: true });
        cy.wait(1000);
        cy.get('[id="layers-selector-button"]').click();
        cy.compareSnapshot("hide-property-layer");
    });

    it("Should display grid layer", () => {
        cy.get('[id="layers-selector-button"]').click();
        cy.get('[id="Property map-switch-label"]').click({ force: true });
        cy.get('[id="Hill shading-switch-label"]').click({ force: true });
        cy.get('[id="Grid-switch-label"]').click({ force: true });
        cy.wait(1000);
        cy.get('[id="layers-selector-button"]').click();
        cy.compareSnapshot("display-grid-layer");
    });

    it("Should hide drawing layer", () => {
        cy.get('[id="layers-selector-button"]').click();
        cy.get('[id="Drawing-switch"]').click({ force: true });
        cy.wait(1000);
        cy.get('[id="drawing-layer-button"]').should("exist");
        cy.get('[id="Drawing-switch"]').click({ force: true });
        cy.wait(1000);
        cy.get('[id="drawing-layer-button"]').should("not.exist");
    });
});
