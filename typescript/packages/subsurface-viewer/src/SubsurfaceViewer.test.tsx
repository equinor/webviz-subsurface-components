import { colorTables } from "@emerson-eps/color-tables";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import type { Unit } from "convert-units";
import "jest-styled-components";
import React from "react";
import mapData from "../../../../example-data/deckgl-map.json";
import SubsurfaceViewer from "./SubsurfaceViewer";

const colorTablesData = colorTables;

describe("Test Map component", () => {
    xit("snapshot test", () => {
        const { container } = render(
            <SubsurfaceViewer
                id={mapData[0].id}
                resources={mapData[0].resources}
                layers={mapData[0].layers}
                bounds={mapData[0].bounds as [number, number, number, number]}
                coords={mapData[0].coords}
                scale={mapData[0].scale}
                coordinateUnit={mapData[0].coordinateUnit as Unit}
                // @ts-expect-error TS2322
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
    xit("snapshot test with edited data", () => {
        const { container } = render(
            <SubsurfaceViewer
                id={mapData[0].id}
                resources={mapData[0].resources}
                layers={mapData[0].layers}
                bounds={mapData[0].bounds as [number, number, number, number]}
                coords={mapData[0].coords}
                scale={mapData[0].scale}
                coordinateUnit={mapData[0].coordinateUnit as Unit}
                // @ts-expect-error TS2322
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
    xit("snapshot test with invalid array length", () => {
        const { container } = render(
            <SubsurfaceViewer
                id={mapData[0].id}
                resources={mapData[0].resources}
                layers={mapData[0].layers}
                // @ts-expect-error: Ignore a compile error for "bounds" prop for the sake of running a scenario
                bounds={[0, 0, 0]}
                coords={mapData[0].coords}
                scale={mapData[0].scale}
                coordinateUnit={mapData[0].coordinateUnit as Unit}
                // @ts-expect-error TS2339
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
});
