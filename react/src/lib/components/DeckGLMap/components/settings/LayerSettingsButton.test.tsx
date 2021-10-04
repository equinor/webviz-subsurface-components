import { render, screen, waitFor } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { testStore, Wrapper } from "../../test/TestWrapper";
import LayerSettingsButton from "./LayerSettingsButton";

describe("test layers settings button", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <LayerSettingsButton
                        layerId="drawing-layer"
                        layerType="DrawingLayer"
                        name="Drawing"
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("click to dispatch redux action", async () => {
        render(
            Wrapper({
                children: (
                    <LayerSettingsButton
                        layerId="drawing-layer"
                        layerType="DrawingLayer"
                        name="Drawing"
                    />
                ),
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
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ["drawing-layer", "view"],
            type: "spec/updateDrawingMode",
        });
    });
    it("should close menu when clicked on backdrop", async () => {
        render(
            Wrapper({
                children: (
                    <LayerSettingsButton
                        layerId="drawing-layer"
                        layerType="DrawingLayer"
                        name="Drawing"
                    />
                ),
            })
        );
        userEvent.click(screen.getByRole("button"));
        const layer_settings_menu = screen.getByRole("menu");
        expect(layer_settings_menu).toBeInTheDocument();
        userEvent.click(document.body);
        await waitFor(() => expect(layer_settings_menu).not.toBeVisible());
    });
    it("should close menu when clicked twice on layers button", async () => {
        render(
            Wrapper({
                children: (
                    <LayerSettingsButton
                        layerId="drawing-layer"
                        layerType="DrawingLayer"
                        name="Drawing"
                    />
                ),
            })
        );
        userEvent.click(screen.getByRole("button"));
        const layer_settings_menu = screen.getByRole("menu");
        expect(layer_settings_menu).toBeInTheDocument();
        userEvent.click(screen.getByRole("button"));
        await waitFor(() => expect(layer_settings_menu).not.toBeVisible());
    });
});
