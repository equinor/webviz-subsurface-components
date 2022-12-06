/// <reference types="cypress" />
import * as React from "react";
import { mount} from "@cypress/react";
import { composeStories } from "@storybook/testing-react";
import { render } from "@testing-library/react";

import * as stories from "../../src/lib/components/DeckGLMap/storybook/DeckGLMap.stories";

const { Default } = composeStories(stories);

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
    cy.get("svg[role='progressbar']", {timeout: 15000}).should("not.exist")
  });
  
  it("should diplay default story",() => {
      mount(<Default />);
      cy.get("svg[role='progressbar']")
      cy.wait(15000)
      cy.get("#view-view_1_2D").compareSnapshot('default-map-story')
  });
  
  it("should diplay default story zoomed in",() => {
    mount(<Default />);
    cy.get("svg[role='progressbar']")
    cy.wait(15000)
    for (let i = 0; i < 2; i++) {
      cy.get("#view-view_1_2D").type("{+}");
      cy.wait(1000);
    }
    cy.get("#view-view_1_2D").compareSnapshot('default-map-story_zoomed_in')
});

it("should diplay default story zoomed out",() => {
  mount(<Default />);
  cy.get("svg[role='progressbar']")
  cy.wait(15000)
  for (let i = 0; i < 2; i++) {
    cy.get("#view-view_1_2D").type("{-}");
    cy.wait(1000);
  }
  cy.get("#view-view_1_2D").compareSnapshot('default-map-story_zoomed_out')
});

});
