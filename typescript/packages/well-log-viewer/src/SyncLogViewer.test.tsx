/* eslint-disable @typescript-eslint/no-var-requires */
import { colorTables } from "@emerson-eps/color-tables";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import SyncLogViewer from "./SyncLogViewer";
import { axisMnemos, axisTitles } from "./utils/axes";

import type { ColorTable } from "./components/ColorTableTypes";
const exampleColorTable = colorTables as unknown as ColorTable[]; // equivalent types, should be merged
const exampleWellLog = require("../../../../example-data/L898MUD.json")[0];
const exampleTemplate = require("../../../../example-data/welllog_template_1.json");

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

describe("Sync Log Viewer", () => {
    it("snapshot test", () => {
        const { container } = render(
            <SyncLogViewer
                id="Sync-Log-Viewer"
                welllogOptions={{
                    hideTrackTitle: true,
                    hideTrackLegend: true,
                }}
                primaryAxis={"md"}
                axisTitles={axisTitles}
                axisMnemos={axisMnemos}
                welllogs={[exampleWellLog]} // the same log for all wellog viewers
                templates={[exampleTemplate]} // the same template for all wellog viewers
                colorTables={exampleColorTable} // the same colortables for all wellog viewers
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
