describe("Map component", () => {
    beforeEach(() => {
        cy.visit("/");
        cy.getIframeBody().find(
            "#root > div > div:nth-child(3) > svg[role='progressbar']",
            {
                timeout: 20000,
            }
        );
        cy.get("body").then(($body) => {
            if ($body.find("#root > div > div.css-1q7pov5 > nav").length > 0) {
                cy.get("body").type("s");
            }
            if (
                $body.find("#root > div > div.react-draggable.css-p5zfqk")
                    .length > 0
            ) {
                cy.get("body").type("a");
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
        cy.matchImageSnapshot();
    });

    it("Should hide color legends", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody().find('[id="Wells-switch"]').click({ force: true });
        cy.wait(2000);
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.matchImageSnapshot();
    });

    it("Should hide faults", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody()
            .find('[id="Fault polygons-switch"]')
            .click({ force: true });
        cy.wait(2000);
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.matchImageSnapshot();
    });

    it("Should hide north arrow", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody()
            .find('[id="NorthArrow3D-switch-label"]')
            .click({ force: true });
        cy.wait(1000);
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.matchImageSnapshot();
    });

    it("Should hide north arrow", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody()
            .find('[id="NorthArrow3D-switch-label"]')
            .click({ force: true });
        cy.wait(1000);
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.matchImageSnapshot();
    });

    it("Should hide hillshading layer", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody()
            .find('[id="Hill shading-switch-label"]')
            .click({ force: true });
        cy.wait(1000);
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.matchImageSnapshot();
    });

    it("Should hide property layer", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody()
            .find('[id="Property map-switch-label"]')
            .click({ force: true });
        cy.wait(1000);
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.matchImageSnapshot();
    });

    it("Should display grid layer", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody()
            .find('[id="Property map-switch-label"]')
            .click({ force: true });
        cy.getIframeBody()
            .find('[id="Hill shading-switch-label"]')
            .click({ force: true });
        cy.getIframeBody()
            .find('[id="Grid-switch-label"]')
            .click({ force: true });
        cy.wait(1000);
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.matchImageSnapshot();
    });

    it("Should hide drawing layer", () => {
        cy.getIframeBody().find('[id="layers-selector-button"]').click();
        cy.getIframeBody().find('[id="Drawing-switch"]').click({ force: true });
        cy.wait(1000);
        cy.getIframeBody()
            .find('[id="drawing-layer-button"]')
            .should("not.exist");
        cy.getIframeBody().find('[id="Drawing-switch"]').click({ force: true });
        cy.wait(1000);
        cy.getIframeBody().find('[id="drawing-layer-button"]').should("exist");
    });
});
