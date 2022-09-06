describe("Map component feature", () => {
    beforeEach(() => {
        cy.visit("/iframe.html?id=deckglmap--default&viewMode=story");
        cy.get("svg[role='progressbar']");
        cy.get("svg[role='progressbar']", {timeout:20000}).should("not.exist")
    });

    it("Should update distance sacle", () => {
        cy.get("#DeckGL-Map-wrapper").trigger("wheel", { deltaY: -45, force: true });
        cy.wait(1000);
        cy.compareSnapshot('zoom-in');
    });
});
