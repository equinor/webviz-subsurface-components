import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import FilterButton from "./FilterButton";

describe("Test Filter Menu", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <FilterButton /> }));
        expect(container.firstChild).toMatchSnapshot();
    });
    it("click to open filter menu and dispatch redux action", async () => {
        render(Wrapper({ children: <FilterButton /> }));
        fireEvent.click(screen.getByTestId("filter_button"));
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: true,
            type: "ui/updateIsDrawerOpen",
        });
    });
    it("Test tooltip title when menu not open", async () => {
        render(Wrapper({ children: <FilterButton /> }));
        fireEvent.mouseOver(screen.getByTestId("filter_button"));
        expect(await screen.findByText("Filter")).toBeInTheDocument();
    });
});
