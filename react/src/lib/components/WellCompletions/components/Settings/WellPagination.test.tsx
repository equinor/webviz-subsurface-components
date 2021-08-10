import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import WellPagination from "./WellPagination";

describe("test pagination", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <WellPagination /> }));
        expect(container.firstChild).toMatchSnapshot();
    });

    it("click to dispatch redux action", async () => {
        render(Wrapper({ children: <WellPagination /> }));
        fireEvent.click(
            screen.getByRole("button", { name: "Go to next page" })
        );
        expect(testStore.dispatch).toHaveBeenCalledTimes(2);
        expect(testStore.dispatch).toBeCalledWith({
            payload: 1,
            type: "ui/updateCurrentPage",
        });
    });
    it("click to dispatch redux action", async () => {
        render(Wrapper({ children: <WellPagination /> }));
        fireEvent.click(screen.getByText("1"));
        expect(testStore.dispatch).toHaveBeenCalledTimes(4);
        expect(testStore.dispatch).toBeCalledWith({
            payload: 1,
            type: "ui/updateCurrentPage",
        });
    });
});
