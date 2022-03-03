describe("Well Completions", () => {
    const slider =
        "#root > div > header > div:nth-child(1) > div > div:nth-child(1) > span:nth-child(2) > span:nth-child(14)";
    before(() => {
        cy.visit("/");
        cy.getIframeBody().find(
            "#root > div > div:nth-child(3) > svg[role='progressbar']",
            {
                timeout: 20000,
            }
        );
        cy.get("body").then(($body) => {
            if ($body.find("#root > div > div.css-1q7pov5 > nav").length <= 0) {
                cy.get("body").type("s");
            }
        });
        cy.get('[id="wellcompletions-demo"]').click();
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

    it("Open Well completions Page from drop-down", () => {
        cy.getIframeBody().find(slider).should("be.visible");
    });

    it("test slider", () => {
        cy.getIframeBody().find(slider).should("have.attr", "aria-valuenow", 0);
        cy.getIframeBody().find(slider).type("{rightarrow}".repeat(1));
        cy.getIframeBody().find(slider).should("have.attr", "aria-valuenow", 1);
        cy.getIframeBody().find(slider).should("have.text", "2000-06-01");
        cy.matchImageSnapshot("updated graph");
    });

    it("test wells per page", () => {
        cy.getIframeBody()
            .find(
                "#root > div > header > div:nth-child(2) > div:nth-child(1) > button"
            )
            .click();
        cy.getIframeBody().find("#wells-per-page-select").select("10");
        cy.getIframeBody()
            .find("#svg-context > g:nth-child(2)")
            .find("g")
            .should("have.length", 10);
    });

    it("test search wells", () => {
        cy.getIframeBody()
            .find("[data-testid='filter_button']")
            .click({ force: true });
        cy.getIframeBody()
            .find("#search-well-name")
            .type("_5", { force: true });
        const values_well = [];

        cy.getIframeBody()
            .find("#svg-context > g:nth-child(2)")
            .find("g")
            .each((el) => {
                cy.wrap(el)
                    .invoke("text")
                    .then((text) => {
                        values_well.push(text);
                    });
            });
        values_well.forEach((elem) => elem.should("have.text", "5"));
    });
});
