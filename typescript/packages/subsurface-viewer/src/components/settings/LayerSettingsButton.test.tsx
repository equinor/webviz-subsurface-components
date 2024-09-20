import { render, screen, waitFor } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { EmptyWrapper } from "../../test/TestWrapper";
import LayerSettingsButton from "./LayerSettingsButton";

const drawingLayer = {
    "@@type": "DrawingLayer",
    name: "Drawing",
    id: "drawing-layer",
    pickable: true,
    visible: true,
    mode: "drawLineString",

    // Props used to get/set data in the drawing layer.
    selectedFeatureIndexes: [] as number[],
    data: {
        type: "FeatureCollection",
        features: [],
    },
};

const wellsLayer = {
    "@@type": "WellsLayer",
    name: "Wells",
    id: "wells-layer",
    autoHighlight: true,
    opacity: 1,
    lineWidthScale: 1,
    pointRadiusScale: 1,
    lineStyle: { dash: false },
    outline: true,
    logRadius: 10,
    logCurves: true,
    refine: true,
    visible: true,
    wellNameVisible: false,
    wellNameAtTop: false,
    wellNameSize: 14,
    wellNameColor: [0, 0, 0, 255],
    selectedWell: "@@#editedData.selectedWells", // used to get data from deckgl layer
    depthTest: true,
};

const layers = [drawingLayer, wellsLayer];

describe("test layers settings button", () => {
    it("snapshot test", () => {
        const { container } = drawingLayer
            ? render(
                  EmptyWrapper({
                      children: <LayerSettingsButton layer={drawingLayer} />,
                  })
              )
            : render(<div />);
        expect(container.firstChild).toMatchSnapshot();
    });

    it("should close menu when clicked on backdrop", async () => {
        const user = userEvent.setup();
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        drawingLayer &&
            render(
                EmptyWrapper({
                    children: <LayerSettingsButton layer={drawingLayer} />,
                })
            );
        await user.click(screen.getByRole("button"));
        const layer_settings_menu = screen.getByRole("menu");
        expect(layer_settings_menu).toBeInTheDocument();
        await user.click(document.body);
        await waitFor(() => expect(layer_settings_menu).not.toBeVisible());
    });

    it("should close menu when clicked twice on layers button", async () => {
        const user = userEvent.setup();
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        drawingLayer &&
            render(
                EmptyWrapper({
                    children: <LayerSettingsButton layer={drawingLayer} />,
                })
            );
        await user.click(screen.getByRole("button"));
        const layer_settings_menu = screen.getByRole("menu");
        expect(layer_settings_menu).toBeInTheDocument();
        await user.click(screen.getByRole("button"));
        await waitFor(() => expect(layer_settings_menu).not.toBeVisible());
    });

    it("tests toggle button", async () => {
        const user = userEvent.setup();
        const wells_layer = layers.find(
            (item) => item["@@type"] === "WellsLayer"
        );
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        wells_layer &&
            render(
                EmptyWrapper({
                    children: <LayerSettingsButton layer={wells_layer} />,
                })
            );
        await user.click(screen.getByRole("button"));
        const wells_layer_settings_menu = screen.getByRole("menu");
        expect(wells_layer_settings_menu).toBeInTheDocument();
    });

    it("tests numeric input", async () => {
        const user = userEvent.setup();
        const wells_layer = layers.find(
            (item) => item["@@type"] === "WellsLayer"
        );
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        wells_layer &&
            render(
                EmptyWrapper({
                    children: <LayerSettingsButton layer={wells_layer} />,
                })
            );
        await user.click(screen.getByRole("button"));
        const wells_layer_settings_menu = screen.getByRole("menu");
        expect(wells_layer_settings_menu).toBeInTheDocument();
    });

    it("tests slider input", async () => {
        const user = userEvent.setup();
        const wells_layer = layers.find(
            (item) => item["@@type"] === "WellsLayer"
        );
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        wells_layer &&
            render(
                EmptyWrapper({
                    children: <LayerSettingsButton layer={wells_layer} />,
                })
            );
        await user.click(screen.getByRole("button"));
        const wells_layer_settings_menu = screen.getByRole("menu");
        expect(wells_layer_settings_menu).toBeInTheDocument();
    });
});
