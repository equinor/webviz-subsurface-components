import "jest";
import { describe, expect, it, jest } from "@jest/globals";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import "jest-styled-components";

import type React from "react";
import type * as ReactModule from "react";

import { layers } from "@equinor/eds-icons";
import { Icon } from "@equinor/eds-core-react";
import type * as EDSCoreReact from "@equinor/eds-core-react";

// added by copilot
jest.mock("@equinor/eds-core-react", () => {
    const actual = jest.requireActual(
        "@equinor/eds-core-react"
    ) as typeof EDSCoreReact;
    const mockReact = jest.requireActual("react") as typeof ReactModule;
    const mockDocument = globalThis.document;

    const Menu = ({
        children,
        onClose,
        open,
        ...props
    }: {
        children: React.ReactNode;
        onClose: () => void;
        open: boolean;
        [key: string]: unknown;
    }) => {
        mockReact.useEffect(() => {
            if (!open) return;

            const handleDocumentClick = () => onClose();
            mockDocument.addEventListener("click", handleDocumentClick);
            return () =>
                mockDocument.removeEventListener("click", handleDocumentClick);
        }, [onClose, open]);

        const menuProps = { ...props };
        delete menuProps["anchorEl"];

        if (!open) {
            return (
                <actual.Menu open={false} onClose={onClose} {...menuProps}>
                    {children}
                </actual.Menu>
            );
        }

        return (
            <div role="menu" {...menuProps}>
                {children}
            </div>
        );
    };

    return {
        ...actual,
        Menu,
    };
});

import { EmptyWrapper } from "../../test/TestWrapper";
import LayersButton from "./LayersButton";

import exampleData from "../../../../../../example-data/deckgl-map.json";

// Ensure layers have an id (which is not stored un the example data) to avoid react error messages
const testLayers: Record<string, unknown>[] = exampleData[0].layers.map(
    (layer) => {
        // @ts-expect-error TS7053
        if (layer["id"] === undefined) {
            // @ts-expect-error TS7053
            layer["id"] = layer["@@type"];
        }
        return layer;
    }
);

describe("test LayersButton", () => {
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
        fireEvent.click(screen.getByRole("button"));
        expect(screen.getByRole("menu")).toBeInTheDocument();
    });
    it("should close menu when clicked on backdrop", async () => {
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
        fireEvent.click(screen.getByRole("button"));
        const layers_menu = screen.getByRole("menu");
        expect(layers_menu).toBeInTheDocument();
        fireEvent.click(document.body);
        await waitFor(() => expect(layers_menu).not.toBeVisible());
    });
    it("should close menu when clicked twice on layers button", async () => {
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
        fireEvent.click(screen.getByRole("button"));
        const layers_menu = screen.getByRole("menu");
        expect(layers_menu).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button"));
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
