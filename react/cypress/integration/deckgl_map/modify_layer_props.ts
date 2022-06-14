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
        cy.get(
            "#panel-tab-content > div:nth-child(1) > div > table > tbody > tr:nth-child(9) > td:nth-child(2) > div > div > div > span.rejt-not-collapsed > svg.rejt-plus-menu.css-16vj5s2"
        ).click();
        cy.fixture("wellLayer.json")
            .as("data")
            .then((data) => {
                cy.get(
                    "#panel-tab-content > div:nth-child(1) > div > table > tbody > tr:nth-child(9) > td:nth-child(2) > div > div > div > span.rejt-not-collapsed > div > span > input"
                ).type(JSON.stringify(data), {
                    parseSpecialCharSequences: false,
                });
            });
        cy.contains("Save").click();
        cy.contains("TypeError").should("not.exist");
    });

    it("Should remove colormap layer", () => {
        cy.getIframeBody().contains("Loading assests...").should("not.exist");
        cy.get(
            "#panel-tab-content > div:nth-child(1) > div > table > tbody > tr:nth-child(9) > td:nth-child(2) > div > div > div > span.rejt-not-collapsed > svg.rejt-plus-menu.css-16vj5s2"
        ).click();
        cy.fixture("wellLayer.json")
            .as("data")
            .then((data) => {
                cy.get(
                    "#panel-tab-content > div:nth-child(1) > div > table > tbody > tr:nth-child(9) > td:nth-child(2) > div > div > div > span.rejt-not-collapsed > div > span > input"
                ).type(JSON.stringify(data), {
                    parseSpecialCharSequences: false,
                });
            });
        cy.contains("Save").click();
        cy.contains("TypeError").should("not.exist");
    });
});
