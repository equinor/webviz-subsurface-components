import { render, screen } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import { testStore, Wrapper } from "../../test/TestWrapper";
import LayerProperty from "./LayerProperty";
import { testState } from "../../test/testReduxState";
describe("Test Layer Property", () => {
    it("snapshot test", () => {
        const drawing_layer = testState.layers.find(
            (item) => item["@@type"] === "DrawingLayer"
        );
        const { container } = drawing_layer
            ? render(
                  Wrapper({
                      children: <LayerProperty layer={drawing_layer} />,
                  })
              )
            : render(<div />);
        expect(container.firstChild).toMatchSnapshot();
    });
    it("select option to dispatch redux action", async () => {
        const drawing_layer = testState.layers.find(
            (item) => item["@@type"] === "DrawingLayer"
        );
        drawing_layer &&
            render(
                Wrapper({
                    children: <LayerProperty layer={drawing_layer} />,
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
