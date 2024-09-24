/* eslint-disable @typescript-eslint/no-var-requires */
import { colorTables } from "@emerson-eps/color-tables";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import WellLogViewWithScroller from "./WellLogViewWithScroller";

import type { ColorFunction } from "./ColorTableTypes";
const exampleColorFunctions = colorTables as ColorFunction[];

// TODO: Fix this the next time the file is edited.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const welllog = require("../../../../../example-data/L898MUD.json")[0];
// TODO: Fix this the next time the file is edited.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const template = require("../../../../../example-data/welllog_template_1.json");

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
                welllog={welllog}
                template={template}
                colorFunctions={exampleColorFunctions}
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
