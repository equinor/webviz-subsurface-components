/* eslint-disable @typescript-eslint/no-var-requires */
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import { LayersList } from "@deck.gl/core/typed";
import Map from "./Map";
import { EmptyWrapper } from "../../SubsurfaceViewer/test/TestWrapper";
import { colorTables } from "@emerson-eps/color-tables";
import {
    ColormapLayer,
    DrawingLayer,
    FaultPolygonsLayer,
    Hillshading2DLayer,
    Map3DLayer,
    NorthArrow3DLayer,
    PieChartLayer,
    WellsLayer,
} from "../layers";

const mapData = require("../../../../demo/example-data/deckgl-map.json");
const colorTablesData = colorTables;
const testBounds = [432205, 6475078, 437720, 6481113] as [
    number,
    number,
    number,
    number
];
const valueRange = [2782, 3513] as [number, number];

const testLayers = [
    new ColormapLayer({
        image: "propertyMap.png",
        rotDeg: 0,
        bounds: testBounds,
        colorMapName: "Rainbow",
        valueRange: valueRange,
        colorMapRange: valueRange,
    }),
    new Hillshading2DLayer({
        bounds: testBounds,
        valueRange: valueRange,
        rotDeg: 0,
        image: "propertyMap.png",
    }),
    new Map3DLayer({
        bounds: testBounds,
        meshMaxError: 5.0,
        mesh: "hugin_depth_25_m_normalized_margin.png",
        meshValueRange: valueRange,
        propertyTexture: "kh_netmap_25_m_normalized_margin.png",
        propertyValueRange: valueRange,
        rotDeg: 0,
        contours: [0, 50.0],
        isContoursDepth: true,
        colorMapName: "Physics",
        colorMapRange: valueRange,
        visible: false,
    }),
    new WellsLayer({
        data: "volve_wells.json",
        logData: "volve_logs.json",
        logrunName: "BLOCKING",
        logName: "ZONELOG",
        logColor: "Stratigraphy",
    }),
    new FaultPolygonsLayer({
        data: "fault_polygons.geojson",
    }),
    new PieChartLayer({
        data: "piechart.json",
    }),
    new NorthArrow3DLayer({
        visible: true,
    }),
    new DrawingLayer(),
] as LayersList;

describe("Test Map component", () => {
    it("snapshot test", () => {
        const { container } = render(
            EmptyWrapper({
                children: (
                    <Map
                        id={mapData[0].id}
                        resources={mapData[0].resources}
                        layers={testLayers}
                        bounds={testBounds}
                        coords={mapData[0].coords}
                        scale={mapData[0].scale}
                        coordinateUnit={mapData[0].coordinateUnit}
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
            EmptyWrapper({
                children: (
                    <Map
                        id={mapData[0].id}
                        resources={mapData[0].resources}
                        layers={testLayers}
                        bounds={testBounds}
                        coords={mapData[0].coords}
                        scale={mapData[0].scale}
                        coordinateUnit={mapData[0].coordinateUnit}
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
