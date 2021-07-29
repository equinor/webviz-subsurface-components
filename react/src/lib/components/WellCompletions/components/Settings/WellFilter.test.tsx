import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import WellFilter from "./WellFilter";

describe("test search wells ", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <WellFilter /> }));
        expect(container.firstChild).toMatchSnapshot();
    });
    it("enter input to dispatch redux action", async () => {
        render(Wrapper({ children: <WellFilter /> }));
        fireEvent.change(screen.getByPlaceholderText("Search well names"), {
            target: { value: "OP_1" },
        });
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: "OP_1",
            type: "ui/updateWellSearchText",
        });
    });
});
