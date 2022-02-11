describe("Go to Well Completions", () => {
    const slider =
        "#root > div > header > div:nth-child(1) > div > div:nth-child(1) > span:nth-child(2) > span:nth-child(14)";
    before(() => {
        cy.visit("/");
        cy.wait(5000);
        cy.get("body").type("s");
        cy.get('[id="wellcompletions-demo"]').click();
    });

    it("Open Well completions Page from drop-down", () => {
        cy.getIframeBody().find(slider).should("be.visible");
        //cy.get('.MuiSlider-root').matchImageSnapshot('slider-image')
        //cy.matchImageSnapshot('blacked-image',{ blackout:['.jss26'] });
    });

    it("test slider", () => {
        cy.getIframeBody().find(slider).should("have.attr", "aria-valuenow", 0);
        cy.getIframeBody().find(slider).type("{rightarrow}".repeat(1));
        cy.getIframeBody().find(slider).should("have.attr", "aria-valuenow", 1);
        cy.getIframeBody().find(slider).should("have.text", "2000-06-01");
        cy.getIframeBody()
            .find("#svg-context")
            .matchImageSnapshot("updated graph");
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
