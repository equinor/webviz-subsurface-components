import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import FilterMenu from "./FilterMenu";

/*
The following tests are breaking due to jest trying to parse a non-js file,
needs investigation to solve this problem.
*/

describe("basic snapshot test Filter Menu", () => {
    it("click to open filter menu",  () => {
        fireEvent.click(screen.getByRole("button"));
        const { container } = render(
            Wrapper({ children: <FilterMenu /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});