import { layers } from "@equinor/eds-icons";
import { Icon } from "@equinor/eds-core-react";
import { render, screen, waitFor } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import { testStore, Wrapper, EmptyWrapper } from "../../test/TestWrapper";
import LayersButton from "./LayersButton";
import { testState } from "../../test/testReduxState";

describe("test 'layers' button", () => {
    it("snapshot test", () => {
        Icon.add({ layers });
        const { container } = render(
            Wrapper({
                children: (
                    <LayersButton
                        id={"layers-button-view_1"}
                        layers={testState.layers}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("click to dispatch redux action", async () => {
        Icon.add({ layers });
        render(
            Wrapper({
                children: (
                    <LayersButton
                        id={"layers-button-view_1"}
                        layers={testState.layers}
                    />
                ),
            })
        );
        userEvent.click(screen.getByRole("button"));
        expect(screen.getByRole("menu")).toBeInTheDocument();
        const property_map_checkbox = screen.getAllByRole("checkbox", {
            name: "Property map",
        })[0];
        userEvent.click(property_map_checkbox);
        expect(testStore.dispatch).toHaveBeenCalledTimes(2);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ["colormap-layer", false],
            type: "spec/updateVisibleLayers",
        });
    });
    it("should close menu when clicked on backdrop", async () => {
        render(
            Wrapper({
                children: (
                    <LayersButton
                        id={"layers-button-view_1"}
                        layers={testState.layers}
                    />
                ),
            })
        );
        userEvent.click(screen.getByRole("button"));
        const layers_menu = screen.getByRole("menu");
        expect(layers_menu).toBeInTheDocument();
        userEvent.click(document.body);
        await waitFor(() => expect(layers_menu).not.toBeVisible());
    });
    it("should close menu when clicked twice on layers button", async () => {
        render(
            Wrapper({
                children: (
                    <LayersButton
                        id={"layers-button-view_1"}
                        layers={testState.layers}
                    />
                ),
            })
        );
        userEvent.click(screen.getByRole("button"));
        const layers_menu = screen.getByRole("menu");
        expect(layers_menu).toBeInTheDocument();
        userEvent.click(screen.getByRole("button"));
        await waitFor(() => expect(layers_menu).not.toBeVisible());
    });
    it("test empty MapState/specbase", () => {
        const { container } = render(
            EmptyWrapper({
                children: (
                    <LayersButton
                        id={"layers-button-view_1"}
                        layers={testState.layers}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("test with no layers present", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <LayersButton id={"layers-button-view_1"} layers={[]} />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
