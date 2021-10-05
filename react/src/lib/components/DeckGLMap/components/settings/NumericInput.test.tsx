import { render, screen } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React, { ChangeEvent } from "react";
import userEvent from "@testing-library/user-event";
import { testStore, Wrapper } from "../../test/TestWrapper";
import NumericInput from "./NumericInput";

describe("Test Numeric Input", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <NumericInput
                        label="Trajectory thickness"
                        value={15}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            e;
                        }}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("select option to dispatch redux action", async () => {
        render(
            Wrapper({
                children: (
                    <NumericInput
                        label="Trajectory thickness"
                        value={0}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            e;
                        }}
                    />
                ),
            })
        );
        userEvent.selectOptions(
            screen.getByRole("combobox", { name: /draw mode/i }),
            "View"
        );
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ["drawing-layer", "view"],
            type: "spec/updateDrawingMode",
        });
    });
});
