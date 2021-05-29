import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import SortButton from "./SortButton";


describe("Test view menu", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <SortButton /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("click to display pop-over menu", async () => {
        render(<SortButton />, {
            wrapper: Wrapper,
        });
        fireEvent.click(screen.getByRole('menuitem', {name :'Sort/Group by Attributes'}))
        await screen.findByText('Well sorting levels')
    });
});