import React from "react";

import "jest";
import { describe, expect, it } from "@jest/globals";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/jest-globals";
import "jest-styled-components";

import type { Layer } from "@deck.gl/core";

import type { LayerPickInfo } from "../layers/utils/layerTools";
import InfoCard from "./InfoCard";

describe("Test InfoCard", () => {
    it("snapshot test with no props", () => {
        const { container } = render(
            <InfoCard
                pickInfos={[
                    {
                        x: 152,
                        y: 254,
                        radius: 1,
                        depth: 638,
                        coordinate: [111, 222],
                    } as unknown as LayerPickInfo,
                    {
                        layer: { id: "wells-layer" } as Layer,
                        property: [
                            {
                                name: "Poro WellA",
                                value: 123,
                            },
                        ],
                    } as unknown as LayerPickInfo,
                ]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("collapse infocard", async () => {
        const user = userEvent.setup();
        render(
            <InfoCard
                pickInfos={[
                    {
                        x: 152,
                        y: 254,
                        radius: 1,
                        depth: 638,
                        coordinate: [111, 222],
                    } as unknown as LayerPickInfo,
                ]}
            />
        );
        const collapse_button = screen.getByRole("button", { name: "" });
        expect(screen.getByText("111.00 m")).toBeVisible();
        await user.click(collapse_button);
        // use queryByText because getByText does throw an error if not found.
        expect(screen.queryByText("111.00 m")).toBeNull();
    });
    it("undefined coordinates", async () => {
        const { container } = render(
            <InfoCard
                pickInfos={[
                    {
                        x: 152,
                        y: 254,
                        radius: 1,
                        depth: 638,
                        coordinate: undefined,
                    } as unknown as LayerPickInfo,
                ]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("snapshot test when property value provided", async () => {
        const { container } = render(
            <InfoCard
                pickInfos={[
                    {
                        x: 152,
                        y: 254,
                        radius: 1,
                        depth: 638,
                        coordinate: [111, 222],
                    } as unknown as LayerPickInfo,
                    {
                        layer: {
                            id: "wells-layer",
                            props: { name: "Wells layer" },
                        },
                        properties: [
                            { name: "Poro", value: 123 },
                            { name: "Perm", value: 456 },
                        ],
                        logName: "LogCurve1",
                    } as unknown as LayerPickInfo,
                    {
                        layer: {
                            id: "hillshading-layer",
                            props: { name: "Hill shading" },
                        },
                        propertyValue: 3152.02,
                    } as unknown as LayerPickInfo,
                ]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
