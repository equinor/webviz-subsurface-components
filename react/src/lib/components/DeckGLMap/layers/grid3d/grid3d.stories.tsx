/* eslint-disable @typescript-eslint/no-var-requires */
import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import DeckGLMap from "../../DeckGLMap";

export default {
    component: DeckGLMap,
    title: "DeckGLMap/Experimental Grid3D",
} as ComponentMeta<typeof DeckGLMap>;

const Template: ComponentStory<typeof DeckGLMap> = (args) => (
    <DeckGLMap {...args} />
);

type POLYDATA = {
    polys: number[];
    points: number[];
    scalar: number[];
    length: number;
};

type ITERATION_TYPE = {
    index: number;
    data: POLYDATA;
};

const defaultProps = {
    bounds: [17489, 5001, 6063, 10990] as [number, number, number, number],
    views: {
        layout: [1, 1] as [number, number],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

let CUR_IDX = 0;
const getPolygon = (index: number, data: POLYDATA) => {
    if (index == 0) CUR_IDX = 0;

    const n = data.polys[CUR_IDX];
    const ni = CUR_IDX + n + 1;
    const polys = data.polys.slice(CUR_IDX + 1, ni);
    CUR_IDX = ni;

    const positions: number[][] = [];
    polys.forEach((p) => {
        const position = data.points.slice(p * 3, p * 3 + 3) as number[];
        positions.push(position);
    });
    return positions;
};

const getFillColor = (index: number, data: POLYDATA) => {
    const x = data.scalar[index];
    if (x < 0.1) return [255 - x * 100, 0, 0, 255];
    if (x < 0.2) return [0, 255 - x * 100, 0, 255];
    else return [255, 0, 255 - x * 100, 255];
};

// Grid 3d story
const POINTS = require("../../../../../demo/example-data/vtk-grid/points.json");
const POLYS = require("../../../../../demo/example-data/vtk-grid/polys.json");
const SCALAR = require("../../../../../demo/example-data/vtk-grid/scalar.json");

const grid3dLayer = {
    "@@type": "PolygonLayer",
    id: "SolidPolygonLayer",
    data: {
        points: POINTS,
        polys: POLYS,
        scalar: SCALAR,
        length: SCALAR.length,
    } as POLYDATA,

    /* props from PolygonLayer class */
    elevationScale: 0,
    extruded: true,
    filled: true,
    getPolygon: (_: unknown, { index, data }: ITERATION_TYPE) =>
        getPolygon(index, data),
    getFillColor: (_: unknown, { index, data }: ITERATION_TYPE) =>
        getFillColor(index, data),
    getLineColor: [0, 0, 0, 255],
    material: false,
    stroked: false,
    wireframe: true,

    autoHighlight: true,
    highlightColor: [0, 0, 128, 128],
    pickable: true,
};

export const Grid3D = Template.bind({});
Grid3D.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [grid3dLayer],
};

Grid3D.parameters = {
    docs: {
        description: {
            story: "3D grid with vtk polydata.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

// 3D grid with intersection data story
const IPOINTS = require("../../../../../demo/example-data/vtk-grid/intersection_points.json");
const IPOLYS = require("../../../../../demo/example-data/vtk-grid/intersection_polys.json");

const intersectionLayer = {
    "@@type": "PolygonLayer",
    id: "IntersectionSolidPolygonLayer",
    data: {
        points: IPOINTS,
        polys: IPOLYS,
        length: 850,
    } as POLYDATA,

    /* props from PolygonLayer class */
    elevationScale: 0,
    extruded: true,
    filled: false,
    getPolygon: (_: unknown, { index, data }: ITERATION_TYPE) =>
        getPolygon(index, data),
    getLineColor: [0, 0, 0, 255],
    getLineWidth: 1,
    material: true,
    stroked: true,
    wireframe: true,
};

export const Grid3DIntersection = Template.bind({});
Grid3DIntersection.args = {
    ...defaultProps,
    id: "grid-3d-intersection",
    layers: [intersectionLayer],
    cameraPosition: {
        zoom: -1.656,
        rotationX: -4.6246,
        rotationOrbit: -36.468,
        target: [463504.568, 5931407.307, -1557.5486],
    },
};

Grid3DIntersection.parameters = {
    docs: {
        description: {
            story: "3D grid intersection geometry using vtk polydata format.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
