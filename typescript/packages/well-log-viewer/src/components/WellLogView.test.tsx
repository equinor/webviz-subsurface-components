import React from "react";

import "jest";
import { describe, expect, it, jest } from "@jest/globals";

import { render } from "@testing-library/react";
import "jest-styled-components";

import { colorTables } from "@emerson-eps/color-tables";

import WellLogView, {
    defaultWellPickLabels,
    resolveWellPickLabels,
} from "./WellLogView";
import type { WellPickLabelInput, WellPickProps } from "./WellLogView";
import type { Template } from "./WellLogTemplateTypes";
import type { WellLogSet } from "./WellLogTypes";
import type { ColormapFunction } from "../utils/color-function";

import viewerTemplateJson from "../../../../../example-data/welllog_template_1.json";
import wellLogL898MUDJson from "../../../../../example-data/L898MUD.json";
import wellPicksJson from "../../../../../example-data/wellpicks.json";

const viewerTemplate = viewerTemplateJson as Template;
const exampleColormapFunctions = colorTables as ColormapFunction[];
const exampleWellLogL898MUD = wellLogL898MUDJson as unknown as WellLogSet[];
const exampleWellPicks = wellPicksJson[0] as unknown as WellLogSet;
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

const pickInput: WellPickLabelInput = {
    horizon: "Top Reservoir",
    vPrimary: 2500.789,
    vSecondary: 2450.123,
};

describe("defaultWellPickLabels", () => {
    it("rounds both depths to whole units and keeps the raw horizon name", () => {
        expect(defaultWellPickLabels(pickInput)).toEqual({
            primary: "2501",
            secondary: "2450",
            horizon: "Top Reservoir",
        });
    });

    it("returns an empty string for undefined or non-finite depths", () => {
        expect(
            defaultWellPickLabels({
                horizon: "Top Reservoir",
                vPrimary: undefined,
                vSecondary: NaN,
            })
        ).toEqual({ primary: "", secondary: "", horizon: "Top Reservoir" });
    });
});

describe("resolveWellPickLabels", () => {
    it("equals the default labels when no callback is provided", () => {
        expect(resolveWellPickLabels(pickInput, undefined)).toEqual(
            defaultWellPickLabels(pickInput)
        );
    });

    it("invokes the callback exactly once per pick with the full-precision values", () => {
        const formatWellPickLabel = jest.fn((input: WellPickLabelInput) => ({
            horizon: input.horizon,
        }));
        resolveWellPickLabels(pickInput, formatWellPickLabel);
        expect(formatWellPickLabel).toHaveBeenCalledTimes(1);
        expect(formatWellPickLabel).toHaveBeenCalledWith(pickInput);
    });

    it("lets a partial return override only the given label", () => {
        const labels = resolveWellPickLabels(pickInput, ({ vPrimary }) => ({
            primary: (vPrimary as number).toFixed(2),
        }));
        expect(labels).toEqual({
            primary: "2500.79",
            secondary: "2450",
            horizon: "Top Reservoir",
        });
    });

    it("lets a callback override all three labels, including the horizon", () => {
        const labels = resolveWellPickLabels(
            pickInput,
            ({ horizon, vPrimary, vSecondary }) => ({
                primary: (vPrimary as number).toFixed(2),
                secondary: (vSecondary as number).toFixed(2),
                horizon: horizon.toUpperCase(),
            })
        );
        expect(labels).toEqual({
            primary: "2500.79",
            secondary: "2450.12",
            horizon: "TOP RESERVOIR",
        });
    });

    it("falls back to the defaults when the callback returns nothing", () => {
        expect(resolveWellPickLabels(pickInput, () => undefined)).toEqual(
            defaultWellPickLabels(pickInput)
        );
        expect(resolveWellPickLabels(pickInput, () => ({}))).toEqual(
            defaultWellPickLabels(pickInput)
        );
    });

    it("handles non-finite depths passed on to the callback without throwing", () => {
        const input: WellPickLabelInput = {
            horizon: "Top Reservoir",
            vPrimary: NaN,
            vSecondary: undefined,
        };
        const labels = resolveWellPickLabels(input, ({ vPrimary }) => ({
            primary: Number.isFinite(vPrimary)
                ? (vPrimary as number).toFixed(2)
                : "",
        }));
        expect(labels).toEqual({
            primary: "",
            secondary: "",
            horizon: "Top Reservoir",
        });
    });

    it("coerces non-string label values to strings", () => {
        const labels = resolveWellPickLabels(
            pickInput,
            () =>
                ({ primary: 1234 }) as unknown as ReturnType<
                    NonNullable<WellPickProps["formatWellPickLabel"]>
                >
        );
        expect(labels.primary).toBe("1234");
    });
});

describe("Well pick label rendering", () => {
    const renderWithWellPick = (
        formatWellPickLabel?: WellPickProps["formatWellPickLabel"]
    ) =>
        render(
            <WellLogView
                wellLogSets={exampleWellLogL898MUD}
                options={{ hideTrackLegend: true, hideTrackTitle: true }}
                template={viewerTemplate}
                colorMapFunctions={exampleColormapFunctions}
                primaryAxis={"md"}
                axisTitles={{ md: "MD", tvd: "TVD", time: "TIME" }}
                axisMnemos={{
                    md: ["DEPTH", "DEPT", "MD", "TDEP", "MD_RKB"],
                    tvd: ["TVD", "TVDSS", "DVER", "TVD_MSL"],
                    time: ["TIME"],
                }}
                wellpick={{
                    wellpick: exampleWellPicks,
                    name: "HORIZON",
                    colorMapFunctions: exampleColormapFunctions,
                    colorMapFunctionName: "Stratigraphy",
                    formatWellPickLabel,
                }}
            />
        );

    const wellPickCells = (container: HTMLElement) =>
        Array.from(container.querySelectorAll<HTMLElement>(".wellpick td")).map(
            (td) => td.textContent
        );

    it("renders the default labels when no formatter is provided", () => {
        const { container } = renderWithWellPick();
        const cells = wellPickCells(container);
        expect(cells.length).toBeGreaterThan(0);
        expect(cells).toContain("1644");
        expect(cells).toContain("Hor_1");
    });

    it("renders the labels returned by the formatter", () => {
        const { container } = renderWithWellPick(({ horizon, vPrimary }) => ({
            primary: Number.isFinite(vPrimary)
                ? (vPrimary as number).toFixed(2)
                : "",
            horizon: horizon.toUpperCase(),
        }));
        const cells = wellPickCells(container);
        expect(cells).toContain("1644.00");
        expect(cells).toContain("HOR_1");
    });
});
