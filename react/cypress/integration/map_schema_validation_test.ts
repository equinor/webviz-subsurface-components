describe("Map component", () => {
    beforeEach(() => {
        cy.visit(
            "http://localhost:6006/?path=/story/deckglmap-schemavalidation--color-table-validation"
        );
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

    it("Should display color table validation", () => {
        cy.matchImageSnapshot();
    });

    it("Should validate fault polygons schema", () => {
        cy.visit(
            "http://localhost:6006/?path=/story/deckglmap-schemavalidation--fault-polygons-validation"
        );
        cy.matchImageSnapshot();
    });

    it("Should validate grid layer schema", () => {
        cy.visit(
            "http://localhost:6006/?path=/story/deckglmap-schemavalidation--grid-layer-validation"
        );
        cy.matchImageSnapshot();
    });
});
