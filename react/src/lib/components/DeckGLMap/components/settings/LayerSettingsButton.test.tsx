import { render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import userEvent from "@testing-library/user-event";
import { testStore, Wrapper } from "../../test/TestWrapper";
import LayerSettingsButton from "./LayerSettingsButton";

describe("test layers settings button", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <LayerSettingsButton
                        layerId="colormap-layer"
                        layerType="ColormapLayer"
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    xit("click to dispatch redux action", async () => {
        render(
            <LayerSettingsButton
                layerId="colormap-layer"
                layerType="ColormapLayer"
            />
        );
        userEvent.click(screen.getByRole("button"));
        expect(screen.getByText(/draw mode/i)).toBeVisible();
        expect(
            screen.getByRole("combobox", { name: /draw mode/i })
        ).toHaveDisplayValue("drawLineString");
        userEvent.selectOptions(
            screen.getByRole("combobox", { name: /draw mode/i }),
            "view"
        );
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ["colormap-layer", "view"],
            type: "spec/updateDrawingMode",
        });
    });
});
