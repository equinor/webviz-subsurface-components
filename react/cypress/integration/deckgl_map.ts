describe("Map component", () => {
    beforeEach(() => {
        cy.visit("/");
        cy.wait(5000);
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
    });

    it("Should hide pie charts", () => {
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
