import React from "react";

import "jest";
import { describe, expect, it, jest } from "@jest/globals";

import { render } from "@testing-library/react";
import "jest-styled-components";

import { colorTables } from "@emerson-eps/color-tables";

import WellLogView, { formatWellPickDepthLabel } from "./WellLogView";
import type { Template } from "./WellLogTemplateTypes";
import type { ColormapFunction } from "../utils/color-function";

import viewerTemplateJson from "../../../../../example-data/welllog_template_1.json";

const viewerTemplate = viewerTemplateJson as Template;
const exampleColormapFunctions = colorTables as ColormapFunction[];
const exampleWellLog = {
    header: {},
    curves: [],
    data: [],
};

globalThis.ResizeObserver =
    globalThis.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

// disable console.warn to avoid warning messages in the test output
jest.spyOn(console, "warn").mockImplementation(() => {});

describe("Test Well Log View Component", () => {
    it("snapshot test", () => {
        const { container } = render(
            <WellLogView
                wellLogSets={[exampleWellLog]}
                options={{
                    checkDatafileSchema: true,
                    hideTrackLegend: true,
                    hideTrackTitle: true,
                }}
                template={viewerTemplate}
                colorMapFunctions={exampleColormapFunctions}
                primaryAxis={"md"}
                axisTitles={{
                    md: "MD",
                    tvd: "TVD",
                    time: "TIME",
                }}
                axisMnemos={{
                    md: ["DEPTH", "DEPT", "MD", "TDEP", "MD_RKB"],
                    tvd: ["TVD", "TVDSS", "DVER", "TVD_MSL"],
                    time: ["TIME"],
                }}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});

describe("formatWellPickDepthLabel", () => {
    it("falls back to toFixed(0) when no formatter callback is provided (default behaviour unchanged)", () => {
        expect(
            formatWellPickDepthLabel(2500.789, "Top Reservoir", undefined)
        ).toBe("2501");
    });

    it("returns an empty string for non-finite depth values", () => {
        expect(
            formatWellPickDepthLabel(undefined, "Top Reservoir", undefined)
        ).toBe("");
        expect(
            formatWellPickDepthLabel(
                NaN,
                "Top Reservoir",
                (name, depth) => `${name}:${depth}`
            )
        ).toBe("");
    });

    it("invokes the custom formatter with the marker name and full-precision depth", () => {
        const formatWellPickLabel = jest.fn(
            (_markerName: string, depth: number) => depth.toFixed(2)
        );
        const result = formatWellPickDepthLabel(
            2500.789,
            "Top Reservoir",
            formatWellPickLabel
        );
        expect(formatWellPickLabel).toHaveBeenCalledWith(
            "Top Reservoir",
            2500.789
        );
        expect(result).toBe("2500.79");
    });
});
