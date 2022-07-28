/* eslint-disable @typescript-eslint/no-var-requires */
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import DeckGLMap from "./DeckGLMap";
import { format } from "d3-format";
import { PickInfo, WellsPickInfo } from "../..";

const mapData = require("../../../demo/example-data/deckgl-map.json");
const colorTablesData = require("../../../demo/example-data/color-tables.json");

function mdTooltip(info: PickInfo<unknown>) {
    if (!info.picked) return null;
    const value = (info as WellsPickInfo)?.properties?.[0].value;
    if (!value) return null;
    const f = format(".2f");
    const niceValue = f(+value);
    return "MD: " + niceValue;
}

describe("Test Map component", () => {
    it("snapshot test", () => {
        const { container } = render(
            <DeckGLMap
                id={mapData[0].id}
                resources={mapData[0].resources}
                layers={mapData[0].layers}
                bounds={mapData[0].bounds}
                zoom={mapData[0].zoom}
                coords={mapData[0].coords}
                scale={mapData[0].scale}
                coordinateUnit={mapData[0].coordinateUnit}
                legend={mapData[0].legend}
                editedData={mapData[0].editedData}
                views={{
                    layout: [1, 1],
                    viewports: [
                        {
                            id: "view_1",
                            show3D: false,
                            layerIds: [],
                        },
                    ],
                }}
                colorTables={[colorTablesData[0]]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("snapshot test with edited data", () => {
        const { container } = render(
            <DeckGLMap
                id={mapData[0].id}
                resources={mapData[0].resources}
                layers={mapData[0].layers}
                bounds={mapData[0].bounds}
                zoom={mapData[0].zoom}
                coords={mapData[0].coords}
                scale={mapData[0].scale}
                coordinateUnit={mapData[0].coordinateUnit}
                legend={mapData[0].legend}
                editedData={{}}
                views={{
                    layout: [1, 1],
                    viewports: [
                        {
                            id: "view_1",
                            show3D: false,
                            layerIds: [],
                        },
                    ],
                }}
                colorTables={[colorTablesData[0]]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("snapshot test with invalid array length", () => {
        const { container } = render(
            <DeckGLMap
                id={mapData[0].id}
                resources={mapData[0].resources}
                layers={mapData[0].layers}
                // @ts-expect-error: Ignore a compile error for "bounds" prop for the sake of running a scenario
                bounds={[0, 0, 0]}
                zoom={mapData[0].zoom}
                coords={mapData[0].coords}
                scale={mapData[0].scale}
                coordinateUnit={mapData[0].coordinateUnit}
                legend={mapData[0].legend}
                editedData={mapData[0].editedData}
                views={{
                    layout: [1, 1],
                    viewports: [
                        {
                            id: "view_1",
                            show3D: false,
                            layerIds: [],
                        },
                    ],
                }}
                colorTables={[colorTablesData[0]]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    xit("snapshot test with over riding tooltip", () => {
        const { container } = render(
            <DeckGLMap
                resources={mapData[0].resources}
                layers={mapData[0].layers}
                views={{
                    layout: [1, 1],
                    showLabel: false,
                    viewports: [
                        { id: "main-view", show3D: false, layerIds: [] },
                    ],
                }}
                checkDatafileSchema={false}
                id={""}
                bounds={[433000, 6476000, 439000, 6480000]}
                getTooltip={mdTooltip}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
