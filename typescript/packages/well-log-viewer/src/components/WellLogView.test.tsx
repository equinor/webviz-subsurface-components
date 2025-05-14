import React from "react";
import { colorTables } from "@emerson-eps/color-tables";
import { render } from "@testing-library/react";
import "jest-styled-components";
import WellLogView from "./WellLogView";
import type { Template } from "./WellLogTemplateTypes";
import type { ColorMapFunction } from "../utils/color-function";

import viewerTemplateJson from "../../../../../example-data/welllog_template_1.json";

const viewerTemplate = viewerTemplateJson as Template;
const exampleColorMapFunctions = colorTables as ColorMapFunction[];
const exampleWellLog = {
    header: {},
    curves: [],
    data: [],
};

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

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
                colorMapFunctions={exampleColorMapFunctions}
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
