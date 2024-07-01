import { layers } from "@equinor/eds-icons";
import { Icon } from "@equinor/eds-core-react";
import { render, screen, waitFor } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import { EmptyWrapper } from "../../test/TestWrapper";
import LayersButton from "./LayersButton";

import exampleData from "../../../../../../example-data/deckgl-map.json";

// Ensure layers have an id (which is not stored un the example data) to avoid react error messages
const testLayers: Record<string, unknown>[] = exampleData[0].layers.map(
    (layer) => {
        if (layer["id"] === undefined) {
            layer["id"] = layer["@@type"];
        }
        return layer;
    }
);

describe("test 'layers' button", () => {
    it("snapshot test", () => {
        Icon.add({ layers });
        const { container } = render(
            EmptyWrapper({
                children: (
                    <LayersButton
                        id={"layers-button-view_1"}
                        layers={testLayers}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("click to dispatch redux action", async () => {
        const user = userEvent.setup();
        Icon.add({ layers });
        render(
            EmptyWrapper({
                children: (
                    <LayersButton
                        id={"layers-button-view_1"}
                        layers={testLayers}
                    />
                ),
            })
        );
        await user.click(screen.getByRole("button"));
        expect(screen.getByRole("menu")).toBeInTheDocument();
    });
    it("should close menu when clicked on backdrop", async () => {
        const user = userEvent.setup();
        render(
            EmptyWrapper({
                children: (
                    <LayersButton
                        id={"layers-button-view_1"}
                        layers={testLayers}
                    />
                ),
            })
        );
        await user.click(screen.getByRole("button"));
        const layers_menu = screen.getByRole("menu");
        expect(layers_menu).toBeInTheDocument();
        await user.click(document.body);
        await waitFor(() => expect(layers_menu).not.toBeVisible());
    });
    it("should close menu when clicked twice on layers button", async () => {
        const user = userEvent.setup();
        render(
            EmptyWrapper({
                children: (
                    <LayersButton
                        id={"layers-button-view_1"}
                        layers={testLayers}
                    />
                ),
            })
        );
        await user.click(screen.getByRole("button"));
        const layers_menu = screen.getByRole("menu");
        expect(layers_menu).toBeInTheDocument();
        await user.click(screen.getByRole("button"));
        await waitFor(() => expect(layers_menu).not.toBeVisible());
    });
    it("test empty MapState/specbase", () => {
        const { container } = render(
            EmptyWrapper({
                children: (
                    <LayersButton
                        id={"layers-button-view_1"}
                        layers={testLayers}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("test with no layers present", () => {
        const { container } = render(
            EmptyWrapper({
                children: (
                    <LayersButton id={"layers-button-view_1"} layers={[]} />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
