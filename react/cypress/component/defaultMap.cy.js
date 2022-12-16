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
    render(<Default />)
    cy.wait(5000)
  });
  
  it("should diplay default story",() => {
      mount(<Default />);
      cy.get("svg[role='progressbar']")
      cy.get("svg[role='progressbar']", {timeout: 60000}).should("not.exist")
      cy.get("#DeckGL-Map-wrapper").compareSnapshot('default-map-story')
  });

  it("should diplay default story with depth test true",() => {
    cy.fixture('example.json').then((exampleData) => {mount(<Default { ...exampleData[0] }/>);})
    cy.get("svg[role='progressbar']")
    cy.get("svg[role='progressbar']", {timeout: 60000}).should("not.exist")
    cy.get("#DeckGL-Map-wrapper").compareSnapshot('wells_on_top')
  });
  
  it("should diplay default story zoomed in",() => {
    mount(<Default />);
    cy.get("svg[role='progressbar']")
    cy.get("svg[role='progressbar']", {timeout: 60000}).should("not.exist")
    for (let i = 0; i < 2; i++) {
      cy.get("#DeckGL-Map-wrapper").type("{+}");
      cy.wait(1000);
    }
    cy.get("#DeckGL-Map-wrapper").compareSnapshot('default-map-story_zoomed_in')
});

it("should diplay default story zoomed out",() => {
  mount(<Default />);
  cy.get("svg[role='progressbar']")
  cy.get("svg[role='progressbar']", {timeout: 60000}).should("not.exist")
  for (let i = 0; i < 2; i++) {
    cy.get("#DeckGL-Map-wrapper").type("{-}");
    cy.wait(1000);
  }
  cy.get("#DeckGL-Map-wrapper").compareSnapshot('default-map-story_zoomed_out')
});

});
