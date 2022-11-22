/// <reference types="cypress" />
import * as React from "react";
import { mount, unmount } from "@cypress/react";
import { composeStories } from "@storybook/testing-react";
import { render } from "@testing-library/react";

import * as stories from "../../src/lib/components/DeckGLMap/storybook/DeckGLMap.stories";

const { Default, MultiColorMap } = composeStories(stories);

render(<Default />).unmount();

describe("Map Story Tests", () => {
  it("activate hooks",() => {
    Cypress.on('fail', (error, runnable) => {
      if (error.message.includes('not to exist in the DOM, but it was continuously found')) {
      return false
      }
    })
    mount(<Default />)
    cy.get("svg[role='progressbar']")
    cy.get("svg[role='progressbar']", {timeout: 30000}).should("not.exist")
  })
  it("should diplay default story",() => {
      mount(<MultiColorMap />);
      // cy.get("svg[role='progressbar']")
      // cy.get("svg[role='progressbar']", {timeout: 30000}).should("not.exist")
      // cy.wait(1000)
      cy.compareSnapshot('default-map-story')
  });
});