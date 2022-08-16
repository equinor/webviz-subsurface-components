/// <reference types="cypress" />
import * as React from "react";
import { mount } from "@cypress/react";
import { composeStories } from "@storybook/testing-react";
//import { render } from "@testing-library/react";

import * as stories from "../../src/lib/components/DeckGLMap/storybook/DeckGLMap.stories";
import * as storiesC from "../../src/lib/components/DeckGLMap.stories";

const { Default, MultiView } = composeStories(stories);
const { TooltipApi, TooltipStyle } = composeStories(storiesC);

//render().unmount();

describe("Map and well", () => {
    it("should diplay default", () => {
        mount(<Default />);
        cy.wait(60000);
    });
    it("should display tooltpi", () => {
        mount(<TooltipApi />);
        cy.wait(60000);
    });
    it("should display tooltpi", () => {
        mount(<TooltipStyle />);
        cy.wait(60000);
    });
    it("should display multiwell", () => {
        mount(<TooltipStyle />);
        cy.wait(60000);
    });
});
