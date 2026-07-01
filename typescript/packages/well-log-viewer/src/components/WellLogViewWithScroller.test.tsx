import React from "react";

import "jest";
import { describe, expect, it, jest } from "@jest/globals";

import { render } from "@testing-library/react";
import "jest-styled-components";

import { colorTables } from "@emerson-eps/color-tables";

import type { Template } from "./WellLogTemplateTypes";
import WellLogViewWithScroller from "./WellLogViewWithScroller";
import type { ColormapFunction } from "../utils/color-function";

import wellLogJson from "../../../../../example-data/L898MUD.json";
import templateJson from "../../../../../example-data/welllog_template_1.json";

const exampleColormapFunctions = colorTables as ColormapFunction[];

globalThis.ResizeObserver =
    globalThis.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

// disable console.warn to avoid warning messages in the test output
jest.spyOn(console, "warn").mockImplementation(() => {});

describe("Test Well Log View Component with Scroller", () => {
    it("snapshot test", () => {
        const { container } = render(
            <WellLogViewWithScroller
                wellLogSets={wellLogJson}
                template={templateJson as Template}
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
                options={{
                    checkDatafileSchema: true,
                    hideTrackLegend: true,
                    hideTrackTitle: true,
                }}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
