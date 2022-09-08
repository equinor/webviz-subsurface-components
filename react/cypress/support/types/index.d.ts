/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
      /**
       * Create several Todo items via UI
       * @example
       * cy.getIframeBody()
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      compareSnapshot(arg0: string): Chainable<any>;
    }
  }
  