import { render, screen, waitFor } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { testStore, Wrapper } from "../../test/TestWrapper";
import LayerSettingsButton from "./LayerSettingsButton";
import { testState } from "../../test/testReduxState";

describe("test layers settings button", () => {
    it("snapshot test", () => {
        const drawing_layer = testState.layers.find(
            (item) => item["@@type"] === "DrawingLayer"
        );
        const { container } = drawing_layer
            ? render(
                  Wrapper({
                      children: <LayerSettingsButton layer={drawing_layer} />,
                  })
              )
            : render(<div />);
        expect(container.firstChild).toMatchSnapshot();
    });
    it("click to dispatch redux action", async () => {
        const drawing_layer = testState.layers.find(
            (item) => item["@@type"] === "DrawingLayer"
        );
        drawing_layer &&
            render(
                Wrapper({
                    children: <LayerSettingsButton layer={drawing_layer} />,
                })
            );
        userEvent.click(screen.getByRole("button"));
        expect(screen.getByText(/draw mode/i)).toBeVisible();
        expect(
            screen.getByRole("combobox", { name: /draw mode/i })
        ).toHaveDisplayValue("Create polyline");
        userEvent.selectOptions(
            screen.getByRole("combobox", { name: /draw mode/i }),
            "View"
        );
        expect(testStore.dispatch).toHaveBeenCalledTimes(2);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ["drawing-layer", "view"],
            type: "spec/updateDrawingMode",
        });
    });
    it("should close menu when clicked on backdrop", async () => {
        const drawing_layer = testState.layers.find(
            (item) => item["@@type"] === "DrawingLayer"
        );
        drawing_layer &&
            render(
                Wrapper({
                    children: <LayerSettingsButton layer={drawing_layer} />,
                })
            );
        userEvent.click(screen.getByRole("button"));
        const layer_settings_menu = screen.getByRole("menu");
        expect(layer_settings_menu).toBeInTheDocument();
        userEvent.click(document.body);
        await waitFor(() => expect(layer_settings_menu).not.toBeVisible());
    });
    it("should close menu when clicked twice on layers button", async () => {
        const drawing_layer = testState.layers.find(
            (item) => item["@@type"] === "DrawingLayer"
        );
        drawing_layer &&
            render(
                Wrapper({
                    children: <LayerSettingsButton layer={drawing_layer} />,
                })
            );
        userEvent.click(screen.getByRole("button"));
        const layer_settings_menu = screen.getByRole("menu");
        expect(layer_settings_menu).toBeInTheDocument();
        userEvent.click(screen.getByRole("button"));
        await waitFor(() => expect(layer_settings_menu).not.toBeVisible());
    });
});
