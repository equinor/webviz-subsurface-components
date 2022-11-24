/* eslint-disable @typescript-eslint/no-var-requires */
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import WellLogView from "./WellLogView";
import { colorTables } from "@emerson-eps/color-tables";

const exampleTemplate = require("../../../../demo/example-data/welllog_template_1.json");
//const exampleWellLog = require("../../../demo/example-data/L898MUD.json")[0];
const exampleWellLog = {
    header: {},
    curves: [],
    data: [],
};
const exampleColorTable = colorTables;

describe("Test Well Log View Component", () => {
    it("snapshot test", () => {
        const { container } = render(
            <WellLogView
                welllog={exampleWellLog}
                options={{
                    checkDatafileSchema: true,
                    hideTrackLegend: true,
                    hideTrackTitle: true,
                }}
                template={exampleTemplate}
                colorTables={exampleColorTable}
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
