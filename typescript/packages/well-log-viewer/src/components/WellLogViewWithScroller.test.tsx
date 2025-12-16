import { colorTables } from "@emerson-eps/color-tables";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";

import type { Template } from "./WellLogTemplateTypes";
import WellLogViewWithScroller from "./WellLogViewWithScroller";
import type { ColormapFunction } from "../utils/color-function";

import wellLogJson from "../../../../../example-data/L898MUD.json";
import templateJson from "../../../../../example-data/welllog_template_1.json";

const exampleColormapFunctions = colorTables as ColormapFunction[];

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

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
