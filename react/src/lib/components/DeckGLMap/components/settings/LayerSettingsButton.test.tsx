import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

    it("tests toggle button", async () => {
        const wells_layer = testState.layers.find(
            (item) => item["@@type"] === "WellsLayer"
        );
        wells_layer &&
            render(
                Wrapper({
                    children: <LayerSettingsButton layer={wells_layer} />,
                })
            );
        userEvent.click(screen.getByRole("button"));
        const wells_layer_settings_menu = screen.getByRole("menu");
        expect(wells_layer_settings_menu).toBeInTheDocument();
        userEvent.click(screen.getByRole("checkbox", { name: "Log curves" }));
        expect(testStore.dispatch).toHaveBeenCalledTimes(7);
        expect(testStore.dispatch).toHaveBeenNthCalledWith(7, {
            payload: ["wells-layer", "logCurves", false],
            type: "spec/updateLayerProp",
        });
    });

    it("tests numeric input", async () => {
        const wells_layer = testState.layers.find(
            (item) => item["@@type"] === "WellsLayer"
        );
        wells_layer &&
            render(
                Wrapper({
                    children: <LayerSettingsButton layer={wells_layer} />,
                })
            );
        userEvent.click(screen.getByRole("button"));
        const wells_layer_settings_menu = screen.getByRole("menu");
        expect(wells_layer_settings_menu).toBeInTheDocument();
        const trajectory_thickness = screen.getAllByRole("spinbutton", {
            name: "",
        })[0];
        userEvent.clear(trajectory_thickness);
        userEvent.type(trajectory_thickness, "7");
        expect(testStore.dispatch).toHaveBeenCalledTimes(10);
        expect(testStore.dispatch).toHaveBeenNthCalledWith(10, {
            payload: ["wells-layer", "lineWidthScale", 7],
            type: "spec/updateLayerProp",
        });
    });

    it("tests slider input", async () => {
        const wells_layer = testState.layers.find(
            (item) => item["@@type"] === "WellsLayer"
        );
        wells_layer &&
            render(
                Wrapper({
                    children: <LayerSettingsButton layer={wells_layer} />,
                })
            );
        userEvent.click(screen.getByRole("button"));
        const wells_layer_settings_menu = screen.getByRole("menu");
        expect(wells_layer_settings_menu).toBeInTheDocument();
        fireEvent.change(screen.getByRole("slider"), { target: { value: 25 } });
        expect(testStore.dispatch).toHaveBeenCalledTimes(12);
        expect(testStore.dispatch).toHaveBeenNthCalledWith(12, {
            payload: ["wells-layer", "opacity", 0.25],
            type: "spec/updateLayerProp",
        });
    });
});
