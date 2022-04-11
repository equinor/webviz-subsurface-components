/* eslint-disable @typescript-eslint/no-var-requires */
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import Map from "./Map";
import { Wrapper } from "../../DeckGLMap/test/TestWrapper";

const mapData = require("../../../../demo/example-data/deckgl-map.json");
const colorTablesData = require("../../../../demo/example-data/color-tables.json");

describe("Test Map component", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <Map
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
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("snapshot test with edited data", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <Map
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
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
