/* eslint-disable @typescript-eslint/no-namespace */
// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { mount } from "@cypress/react18";

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
    namespace Cypress {
        interface Chainable {
            mount: typeof mount;
        }
    }
}

Cypress.Commands.add("mount", mount);

// Cypress.on("uncaught:exception", (err, runnable) => {
//     // returning false here prevents Cypress from
//     // failing the test
//     return true;
// });

Cypress.on('uncaught:exception', (err, runnable) => {
if (err.message.includes('The source image could not be decoded')) {
    return false
}
})

// Example use:
// cy.mount(<MyComponent />)
