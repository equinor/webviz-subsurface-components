/* eslint-disable @typescript-eslint/no-var-requires */
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import WellLogViewer from "./WellLogViewer";
import { WellLogController } from "./components/WellLogView";
import { axisTitles, axisMnemos } from "./utils/axes";
import { colorTables } from "@emerson-eps/color-tables";

const exampleTemplate = require("../../../demo/example-data/welllog_template_1.json");
const exampleWellLog = require("../../../demo/example-data/L898MUD.json")[0];
const exampleColorTable = colorTables;

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
                primaryAxis={"md"}
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
