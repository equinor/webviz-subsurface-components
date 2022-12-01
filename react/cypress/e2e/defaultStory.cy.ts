describe('Default Story', () => {
  it('Displays default story', () => {
    cy.visit('https://equinor.github.io/webviz-subsurface-components/storybook-static/iframe.html?id=deckglmap--default');
    cy.contains("Loading assets...");
    cy.contains("Loading assets...", {timeout: 30000}).should("not.exist");
    cy.wait(1000)
    cy.compareSnapshot('default-map-story_e2e')
  })
  it('Zoom-in default story', () => {
    cy.visit('https://equinor.github.io/webviz-subsurface-components/storybook-static/iframe.html?id=deckglmap--default');
    cy.contains("Loading assets...");
    cy.contains("Loading assets...", {timeout: 30000}).should("not.exist");
    for (let i = 0; i < 2; i++) {
      cy.get("#view-view_1_2D").type("{+}");
      cy.wait(1000);
    }
    cy.wait(1000)
    cy.compareSnapshot('default-map-story-zoomed-in_e2e')
  })
  it('Zoom-out default story', () => {
    cy.visit('https://equinor.github.io/webviz-subsurface-components/storybook-static/iframe.html?id=deckglmap--default');
    cy.contains("Loading assets...");
    cy.contains("Loading assets...", {timeout: 30000}).should("not.exist");
    for (let i = 0; i < 2; i++) {
      cy.get("#view-view_1_2D").type("{-}");
      cy.wait(1000);
    }
    cy.wait(1000)
    cy.compareSnapshot('default-map-story-zoomed-out_e2e')
  })
})