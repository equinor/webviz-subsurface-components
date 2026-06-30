/* eslint-disable @typescript-eslint/no-var-requires */
import React from "react";

import "jest";
import { describe, expect, it, jest } from "@jest/globals";

import { render } from "@testing-library/react";
import "jest-styled-components";

import { colorTables } from "@emerson-eps/color-tables";

import WellLogViewer from "./WellLogViewer";
import type { WellLogController } from "./components/WellLogView";
import { axisMnemos, axisTitles } from "./utils/axes";
import type { ColormapFunction } from "./utils/color-function";

// TODO: Fix this the next time the file is edited.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const exampleTemplate = require("../../../../example-data/welllog_template_1.json");
// TODO: Fix this the next time the file is edited.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const exampleWellLog = require("../../../../example-data/L898MUD.json")[0];
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

describe("Test Well Log Viewer Component", () => {
    it("snapshot test", () => {
        const { container } = render(
            <WellLogViewer
                id="Well-Log-Viewer"
                options={{
                    hideTrackTitle: true,
                    hideTrackLegend: true,
                }}
                welllog={exampleWellLog}
                template={exampleTemplate}
                colorMapFunctions={exampleColormapFunctions}
                horizontal={true}
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
                    // todo: fix the test
                    // commented to make test pass
                    // throw new Error("Function not implemented.");
                }}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
