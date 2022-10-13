/* eslint-disable @typescript-eslint/no-var-requires */
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import WellLogViewer from "./WellLogViewer";
import { WellLogController } from "./components/WellLogView";
import { axisTitles, axisMnemos } from "./utils/axes";

const exampleTemplate = require("../../../demo/example-data/welllog_template_1.json");
const exampleWellLog = require("../../../demo/example-data/L898MUD.json")[0];
const exampleColorTable = require("../../../demo/example-data/color-tables.json");

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

describe("Test Well Log Viewer Component", () => {
    it("snapshot test", () => {
        const { container } = render(
            <WellLogViewer
                id="Well-Log-Viewer"
                welllog={exampleWellLog}
                template={exampleTemplate}
                colorTables={exampleColorTable}
                horizontal={true}
                hideLegend={true}
                hideTitles={true}
                axisTitles={axisTitles}
                axisMnemos={axisMnemos}
                readoutOptions={{
                    allTracks: false,
                    grouping: "by_track",
                }}
                onCreateController={(controller: WellLogController) =>
                    controller
                }
                onContentRescale={function (): void {
                    throw new Error("Function not implemented.");
                }}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
