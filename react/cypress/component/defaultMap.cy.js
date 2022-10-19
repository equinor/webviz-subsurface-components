/// <reference types="cypress" />
import * as React from "react";
import { mount } from "@cypress/react";
import { composeStories } from "@storybook/testing-react";
import { render } from "@testing-library/react";

import * as stories from "../../src/lib/components/DeckGLMap/storybook/DeckGLMap.stories";

const { Default } = composeStories(stories);

render(<Default />).unmount();

describe("Map Story Tests", () => {
  it("should diplay default story",{
      "retries": {
        "runMode": 1,
      }
    } ,() => {
      mount(<Default />);
      cy.get("svg[role='progressbar']")
      //cy.get("svg[role='progressbar']", {timeout: 180000}).should("not.exist")
      cy.wait(1000)
      cy.compareSnapshot('default-map-story')
  });
});
