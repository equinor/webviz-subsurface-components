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
  cy.get("svg[role='progressbar']", {timeout: 10000}).should("not.exist")
})

describe("Map Story Tests", () => {
  it("should diplay default story",() => {
      mount(<Default />);
      cy.get("svg[role='progressbar']")
      cy.get("svg[role='progressbar']", {timeout: 30000}).should("not.exist")
      cy.wait(1000)
      cy.compareSnapshot('default-map-story')
  });
});