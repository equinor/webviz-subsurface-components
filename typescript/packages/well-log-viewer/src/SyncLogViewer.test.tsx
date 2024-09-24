/* eslint-disable @typescript-eslint/no-var-requires */
import { colorTables } from "@emerson-eps/color-tables";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import SyncLogViewer from "./SyncLogViewer";
import { axisMnemos, axisTitles } from "./utils/axes";

import type { ColorFunction } from "./components/ColorTableTypes";
const exampleColorFunction = colorTables as unknown as ColorFunction[];
// TODO: Fix this the next time the file is edited.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const exampleWellLog = require("../../../../example-data/L898MUD.json")[0];
// TODO: Fix this the next time the file is edited.
// eslint-disable-next-line @typescript-eslint/no-require-imports
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
                colorFunctions={exampleColorFunction} // the same colortables for all wellog viewers
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
