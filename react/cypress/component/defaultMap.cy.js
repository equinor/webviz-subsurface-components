/// <reference types="cypress" />
import * as React from "react";
import { mount, unmount } from "@cypress/react";
import { composeStories } from "@storybook/testing-react";
import { render } from "@testing-library/react";

import * as stories from "../../src/lib/components/DeckGLMap/storybook/DeckGLMap.stories";

const { Default } = composeStories(stories);

render(<Default />).unmount();
it("activate hooks",(done) => {
  cy.on('fail', (error, runnable) => {
    done()
    return false;
  })
  
  mount(<Default />)
  cy.get("svg[role='progressbar']")
  cy.get("svg[role='progressbar']", {timeout: 30000}).should("not.exist")
  done()
})

describe("Map Story Tests", () => {
  it("should diplay default story",() => {
      mount(<Default />);
      cy.get("svg[role='progressbar']")
      cy.get("svg[role='progressbar']", {timeout: 30000}).should("not.exist")
      cy.wait(1000)
      cy.compareSnapshot('default-map-story')
  });
  
  it("should diplay default story zoomed in",() => {
    mount(<Default />);
    cy.get("svg[role='progressbar']")
    cy.get("svg[role='progressbar']", {timeout: 30000}).should("not.exist")
    cy.wait(1000)
    for (let i = 0; i < 4; i++) {
      cy.get("#view-view_1_2D").trigger("wheel", {
        deltaY: -66.666666,
        wheelDelta: 120,
        wheelDeltaX: 0,
        wheelDeltaY: 120,
      });
    }
    cy.wait(1000);
    cy.compareSnapshot('default-map-story_zoomed_in')
});

it("should diplay default story zoomed out",() => {
  mount(<Default />);
  cy.get("svg[role='progressbar']")
  cy.get("svg[role='progressbar']", {timeout: 30000}).should("not.exist")
  cy.wait(1000)
  for (let i = 0; i < 5; i++) {
    cy.get("#view-view_1_2D").trigger("wheel", {
      deltaY: 66.666666,
      wheelDelta: 120,
      wheelDeltaX: 0,
      wheelDeltaY: 120,
    });
  }
  cy.wait(1000);
  cy.compareSnapshot('default-map-story_zoomed_out')
});
});