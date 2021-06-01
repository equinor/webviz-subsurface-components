import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../../test/TestWrapper";
import FilterMenu from "./FilterMenu";

describe("basic snapshot test Filter Menu", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <FilterMenu /> }));
        expect(container.firstChild).toMatchSnapshot();
    });
    it("click to open filter menu", () => {
        //TODO update tests
    });
});
