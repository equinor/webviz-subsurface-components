import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import renderer from "react-test-renderer";
import { testStore, Wrapper } from "../../test/testReduxWrapper";
import HideZeroCompletionsSwitch from "./HideZeroCompletionsSwitch";

describe("test hide zero completions switch", () => {
    it("snapshot test", () => {
        const tree = renderer
            .create(Wrapper({ children: <HideZeroCompletionsSwitch /> }))
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
    it("click to dispatch redux action", async () => {
        render(<HideZeroCompletionsSwitch />, {
            wrapper: Wrapper,
        });
        fireEvent.click(screen.getByRole("checkbox"));
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: true,
            type: "ui/updateHideZeroCompletions",
        });
    });
});
