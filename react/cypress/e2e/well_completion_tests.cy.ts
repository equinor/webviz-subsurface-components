describe("Well Completions", () => {
    const slider =
        "#root > div > header > div:nth-child(1) > div > div:nth-child(1) > span:nth-child(2) > span:nth-child(14)";
        beforeEach(() => {
            cy.visit("/iframe.html?id=wellcompletions-demo--well-completion&viewMode=story");
        });

    it("Open Well completions Page from drop-down", () => {
        cy.get(slider).should("be.visible");
    });

    it("test slider", () => {
        cy.get(slider).should("have.attr", "aria-valuenow", 0);
        cy.get(slider).type("{rightarrow}".repeat(1));
        cy.get(slider).should("have.attr", "aria-valuenow", 1);
        cy.get(slider).should("have.text", "2000-06-01");
        cy.compareSnapshot("updated graph");
    });

    it("test wells per page", () => {
        cy.get("#root > div > header > div:nth-child(2) > div:nth-child(1) > button").click();
        cy.get("#wells-per-page-select").select("10");
        cy.get("#svg-context > g:nth-child(2)").find("g").should("have.length", 10);
    });

    it("test search wells", () => {
        cy.get("[data-testid='filter_button']").click({ force: true });
        cy.get("#search-well-name").type("_5", { force: true });
        const values_well : string[] = [];

        cy.get("#svg-context > g:nth-child(2)")
            .find("g")
            .each((el) => {
                cy.wrap(el)
                    .invoke("text")
                    .then((text) => {
                        values_well.push(text);
                    });
            });
        values_well.forEach((elem) => elem.includes("5"))
    });
});
