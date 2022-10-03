import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import DeckGLMap from "../../DeckGLMap";

export default {
    component: DeckGLMap,
    title: "DeckGLMap/Grid3D",
} as ComponentMeta<typeof DeckGLMap>;

const POINTS = require("../../../../../demo/example-data/vtk-grid/points.json");;
const POLYS = require("../../../../../demo/example-data/vtk-grid/polys.json");
const SCALAR = require("../../../../../demo/example-data/vtk-grid/scalar.json");

let CUR_IDX = 0;
const getPolygon = (object, { index, data }) => {
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

const getFillColor = (object, { index, data }) => {
    const x = data.scalar[index];
    if (x < 0.1) return [255 - x * 100, 0, 0, 255];
    if (x < 0.2) return [0, 255 - x * 100, 0, 255];
    else return [255, 0, 255 - x * 100, 255];
};

// layers defination
const grid3dLayer = {
    "@@type": "PolygonLayer",
    id: "SolidPolygonLayer",
    data: {
        points: POINTS,
        polys: POLYS,
        scalar: SCALAR,
        length: SCALAR.length,
    },

    /* props from PolygonLayer class */
    elevationScale: 0,
    extruded: true,
    filled: true,
    getPolygon: (object, { index, data }) =>
        getPolygon(object, { index, data }),
    getFillColor: (object, { index, data }) =>
        getFillColor(object, { index, data }),
    getLineColor: [0, 0, 0, 255],
    material: false,
    stroked: false,
    wireframe: true,

    autoHighlight: true,
    highlightColor: [0, 0, 128, 128],
    pickable: true,
};


const Template: ComponentStory<typeof DeckGLMap> = (args) => (
    <DeckGLMap {...args} />
);

const defaultProps = {
    bounds: [17489.34375, 5001, 6063.6875, 10990.5] as [
        number,
        number,
        number,
        number
    ],
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

// Grid 3d story
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
