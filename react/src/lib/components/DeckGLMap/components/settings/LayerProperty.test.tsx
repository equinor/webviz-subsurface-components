import { render, screen } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import { testStore, Wrapper } from "../../test/TestWrapper";
import LayerProperty from "./LayerProperty";

describe("Test Layer Property", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: <LayerProperty layerId="drawing-layer" />,
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("select option to dispatch redux action", async () => {
        render(
            Wrapper({
                children: <LayerProperty layerId="drawing-layer" />,
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
