/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        /**
         * Create several Todo items via UI
         * @example
         * cy.getIframeBody()
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getIframeBody(): Chainable<any>;
    }
}
