import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../../test/TestWrapper";
import SortTable from "./SortTable";

describe("test sorting the table", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <SortTable /> }));
        expect(container.firstChild).toMatchSnapshot();
    });

    it("test to check ascending sort", async () => {
        const { container } = render(<SortTable />, {
            wrapper: Wrapper,
        });

        //fireEvent.click(screen.getByRole('menuitem', {name :'Sort/Group by Attributes'}))
        fireEvent.click(screen.getByRole("button", { name: "Ascending" }));
        await screen.findByText("Descending");
    });
});
