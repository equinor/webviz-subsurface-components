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
                    .length < 0
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

    it("Should add a wells layer", () => {
        cy.getIframeBody().contains("Loading assests...").should("not.exist");
        const $li = Cypress.$("td:contains('layers')");

        cy.wrap($li)
            .last()
            .find(
                "div > div > div > span.rejt-not-collapsed > svg.rejt-plus-menu"
            )
            .click();

        cy.fixture("wellLayer.json")
            .as("data")
            .then((data) => {
                cy.get("input[placeholder='Value']").type(
                    JSON.stringify(data),
                    {
                        parseSpecialCharSequences: false,
                    }
                );
            });
        cy.contains("Save").click();
        cy.contains("TypeError").should("not.exist");
    });

    it("Should remove colormap layer", () => {
        cy.getIframeBody().contains("Loading assests...").should("not.exist");
        const $li = Cypress.$("td:contains('layers')");

        cy.wrap($li)
            .last()
            .find(
                "div > div > div > span.rejt-not-collapsed >  ul > div:nth-child(1) > span.rejt-collapsed > svg"
            )
            .click();
        cy.contains("TypeError").should("not.exist");
    });
});
