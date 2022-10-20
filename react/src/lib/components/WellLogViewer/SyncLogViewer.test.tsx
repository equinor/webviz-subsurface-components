/* eslint-disable @typescript-eslint/no-var-requires */
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import SyncLogViewer from "./SyncLogViewer";
import { colorTables } from "@emerson-eps/color-tables";

const exampleWellLog = require("../../../demo/example-data/L898MUD.json")[0];
const exampleTemplate = require("../../../demo/example-data/welllog_template_1.json");
const exampleColorTables = colorTables;

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
                hideTitles={true}
                hideLegend={true}
                welllogs={[exampleWellLog]}
                templates={[exampleTemplate]}
                colorTables={[exampleColorTables]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
