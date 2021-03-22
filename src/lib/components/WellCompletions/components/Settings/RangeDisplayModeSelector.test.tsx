import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import renderer from "react-test-renderer";
import { testStore, Wrapper } from "../../test/testReduxWrapper";
import RangeDisplayModeSelector from "./RangeDisplayModeSelector";

describe("test range display mode selector", () => {
    it("snapshot test", () => {
        const tree = renderer
            .create(Wrapper({ children: <RangeDisplayModeSelector /> }))
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("click to dispatch redux action", async () => {
        render(<RangeDisplayModeSelector />, {
            wrapper: Wrapper,
        });
        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "Average" },
        });
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: "Average",
            type: "ui/updateRangeDisplayMode",
        });
    });
});
