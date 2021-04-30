import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import HideZeroCompletionsSwitch from "./HideZeroCompletionsSwitch";

describe("test hide zero completions switch", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <HideZeroCompletionsSwitch /> })
        );
        expect(container.firstChild).toMatchSnapshot();
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
