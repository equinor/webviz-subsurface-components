import { fireEvent, render, screen} from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../../test/TestWrapper";
import FilterByAttributesButton from "./FilterByAttributesButton";

/*
The following tests are breaking due to jest trying to parse a non-js file,
needs investigation to solve this problem.
*/
describe("Test filter by attributes button", () => {

    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <FilterByAttributesButton /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    
    it("click to open filter by attribute dialogue", async () => {
        render(<FilterByAttributesButton />, {
            wrapper: Wrapper,
        });
        fireEvent.click(screen.getByRole("Filter by Attributes"));
        await screen.findByLabelText('Filter by Attributes')
    });

});
