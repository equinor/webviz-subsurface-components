/// <reference types="cypress" />
import * as React from "react";
import { composeStories } from "@storybook/testing-react";

import * as stories from "../../src/lib/components/DeckGLMap/storybook/DeckGLMap.stories";

const { Default } = composeStories(stories);

describe("Map Component", () => {
    it("should diplay default map story", () => {
        cy.mount(<Default />);
        cy.get("svg[role='progressbar']");
        cy.get("svg[role='progressbar']", {timeout:25000}).should("not.exist");
        cy.matchImage();
    });
});
