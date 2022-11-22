/// <reference types="cypress" />
import * as React from "react";
import { mount } from "@cypress/react";
import { composeStories } from "@storybook/testing-react";
//import { render } from "@testing-library/react";

import * as stories from "../../src/lib/components/DeckGLMap/layers/wells/wellsLayer.stories";

const { VolveWells, DashedWells, CustomColoredWells, CustomWidthWells } =
    composeStories(stories);

//render().unmount();

xdescribe("Wells", () => {
    it("should display volve wells story", () => {
        mount(<VolveWells />);
        cy.wait(5000);
    });
    it("should display dashed wells", () => {
        mount(<DashedWells />);
        cy.wait(5000);
    });
    it("should display custom color wells", () => {
        mount(<CustomColoredWells />);
        cy.wait(5000);
    });
    it("should display custom color wells", () => {
        mount(<CustomWidthWells />);
        cy.wait(5000);
    });
});
