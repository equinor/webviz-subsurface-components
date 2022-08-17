/// <reference types="cypress" />
import * as React from "react";
import { mount } from "@cypress/react";
import { composeStories } from "@storybook/testing-react";
import { render } from "@testing-library/react";

import * as stories from "../../src/lib/components/DeckGLMap/storybook/DeckGLMap.stories";
import * as storiesC from "../../src/lib/components/DeckGLMap/DeckGLMap.stories";
import { Map } from "../../../react/src/lib/components/DeckGLMap/components/Map";

const { Default, MultiView } = composeStories(stories);
const { TooltipApi, TooltipStyle } = composeStories(storiesC);

//render().unmount();

describe("Map and well", () => {
    it("should diplay default", () => {
        mount(<Map />);
        cy.wait(10000);
    });
    it("should diplay default", () => {
        mount(<Default />);
        cy.wait(10000);
    });
    it("should display tooltpi", () => {
        mount(<TooltipApi />);
        cy.wait(10000);
    });
    it("should display tooltpi", () => {
        mount(<TooltipStyle />);
        cy.wait(10000);
    });
    it("should display multiwell", () => {
        mount(<MultiView />);
        cy.wait(10000);
    });
});
