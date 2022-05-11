// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import compareSnapshotCommand from "cypress-visual-regression/dist/command";

compareSnapshotCommand({ errorThreshold: 0.005 });

Cypress.Commands.add("getIframeBody", () => {
    cy.log("getIframeBody");

    // get the storybook's iframe > document > body,
    // then wraps the body element to allow for continued chaining
    // i.e. cy.getIframeBody().findBy(...)
    return cy
        .get("#storybook-preview-iframe")
        .its("0.contentDocument.body")
        .should("not.be.empty")

        .then((body) => cy.wrap(body));
});
