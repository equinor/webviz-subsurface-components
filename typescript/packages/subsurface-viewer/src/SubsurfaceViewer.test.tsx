/* eslint-disable @typescript-eslint/no-var-requires */
import { colorTables } from "@emerson-eps/color-tables";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import SubsurfaceViewer from "./SubsurfaceViewer";

import type { Unit } from "convert-units";
import mapData from "../../../../example-data/deckgl-map.json";

const colorTablesData = colorTables;

describe("Test Map component", () => {
    it("snapshot dummy test", () => {
        expect(true).toBe(true);
    });

    // it("snapshot test", () => {
    //     const { container } = render(
    //         <SubsurfaceViewer
    //             id={mapData[0].id}
    //             resources={mapData[0].resources}
    //             layers={mapData[0].layers}
    //             bounds={mapData[0].bounds as [number, number, number, number]}
    //             coords={mapData[0].coords}
    //             scale={mapData[0].scale}
    //             coordinateUnit={mapData[0].coordinateUnit as Unit}
    //             legend={mapData[0].legend}
    //             editedData={mapData[0].editedData}
    //             views={{
    //                 layout: [1, 1],
    //                 viewports: [
    //                     {
    //                         id: "view_1",
    //                         show3D: false,
    //                         layerIds: [],
    //                     },
    //                 ],
    //             }}
    //             colorTables={[colorTablesData[0]]}
    //         />
    //     );
    //     expect(container.firstChild).toMatchSnapshot();
    // });
    // it("snapshot test with edited data", () => {
    //     const { container } = render(
    //         <SubsurfaceViewer
    //             id={mapData[0].id}
    //             resources={mapData[0].resources}
    //             layers={mapData[0].layers}
    //             bounds={mapData[0].bounds as [number, number, number, number]}
    //             coords={mapData[0].coords}
    //             scale={mapData[0].scale}
    //             coordinateUnit={mapData[0].coordinateUnit as Unit}
    //             legend={mapData[0].legend}
    //             editedData={{}}
    //             views={{
    //                 layout: [1, 1],
    //                 viewports: [
    //                     {
    //                         id: "view_1",
    //                         show3D: false,
    //                         layerIds: [],
    //                     },
    //                 ],
    //             }}
    //             colorTables={[colorTablesData[0]]}
    //         />
    //     );
    //     expect(container.firstChild).toMatchSnapshot();
    // });
    // it("snapshot test with invalid array length", () => {
    //     const { container } = render(
    //         <SubsurfaceViewer
    //             id={mapData[0].id}
    //             resources={mapData[0].resources}
    //             layers={mapData[0].layers}
    //             // @ts-expect-error: Ignore a compile error for "bounds" prop for the sake of running a scenario
    //             bounds={[0, 0, 0]}
    //             coords={mapData[0].coords}
    //             scale={mapData[0].scale}
    //             coordinateUnit={mapData[0].coordinateUnit as Unit}
    //             legend={mapData[0].legend}
    //             editedData={mapData[0].editedData}
    //             views={{
    //                 layout: [1, 1],
    //                 viewports: [
    //                     {
    //                         id: "view_1",
    //                         show3D: false,
    //                         layerIds: [],
    //                     },
    //                 ],
    //             }}
    //             colorTables={[colorTablesData[0]]}
    //         />
    //     );
    //     expect(container.firstChild).toMatchSnapshot();
    // });
});
