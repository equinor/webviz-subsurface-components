describe("Map component", () => {
    beforeEach(() => {
        cy.visit("/");
        cy.getIframeBody().find(
            "#root > div > div:nth-child(3) > svg[role='progressbar']",
            {
                timeout: 20000,
            }
        );
        cy.get("#storybook-panel-root").then(($body) => {
            if ($body.is(":visible")) {
                cy.get("body").type("a");
            }
        });

        cy.get("body").then(($body) => {
            if ($body.find("nav.sidebar-container").length > 0) {
                cy.get("body").type("s");
            }
        });
        cy.getIframeBody()
            .find("#root > div > div:nth-child(3) > svg[role='progressbar']", {
                timeout: 30000,
            })
            .should("not.exist");
    });

    it("Should hide pie charts", () => {
        cy.getIframeBody()
            .find('[id="layers-selector-button"]')
            .click({ waitForAnimations: false });
        cy.getIframeBody()
            .find("[id='Pie chart-switch']")
            .click({ force: true });
        cy.wait(2000);
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody().find("#view-view_1_2D").click();
        cy.wait(1000);
        cy.compareSnapshot("hide_pie_chart");
    });

    it("Should hide color legends", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody().find('[id="Wells-switch"]').click({ force: true });
        cy.wait(2000);
        cy.getIframeBody().find("#view-view_1_2D").click();
        cy.wait(1000);
        cy.compareSnapshot("hide_color_legend");
    });

    it("Should hide faults", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody()
            .find('[id="Fault polygons-switch"]')
            .click({ force: true });
        cy.wait(2000);
        cy.getIframeBody().find("#view-view_1_2D").click();
        cy.wait(1000);
        cy.compareSnapshot("hide_faults");
    });

    it("Should hide north arrow", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody().find("#NorthArrow3D-switch").click({ force: true });
        cy.wait(1000);
        cy.getIframeBody().find("#view-view_1_2D").click();
        cy.wait(1000);
        cy.compareSnapshot("hide_north_arrow");
    });

    it("Should hide hillshading layer", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody()
            .find('[id="Hill shading-switch"]')
            .click({ force: true });
        cy.wait(1000);
        cy.getIframeBody().find("#view-view_1_2D").click();
        cy.wait(1000);
        cy.compareSnapshot("hide_hillshading_layer");
    });

    it("Should hide property layer", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody()
            .find('[id="Property map-switch"]')
            .click({ force: true });
        cy.wait(1000);
        cy.getIframeBody().find("#view-view_1_2D").click();
        cy.wait(1000);
        cy.compareSnapshot("hide_property_layer");
    });

    it("Should hide drawing layer", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody().find('[id="Drawing-switch"]').click({ force: true });
        cy.wait(1000);
        cy.getIframeBody().find('[id="drawing-layer-button"]').should("exist");
        cy.getIframeBody().find('[id="Drawing-switch"]').click({ force: true });
        cy.getIframeBody()
            .find('[id="drawing-layer-button"]')
            .should("not.exist");
    });
});
