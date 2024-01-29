import React from "react";
import { create, all } from "mathjs";

import type { ComponentStory, ComponentMeta } from "@storybook/react";
import SubsurfaceViewer, { TGrid3DColoringMode } from "../../SubsurfaceViewer";

import {
    Points as SnubCubePoints,
    Faces as SnubCubeFaces,
    VertexCount as SnubCubeVertexCount,
} from "./test_data/TruncatedSnubCube";

import {
    Points as ToroidPoints,
    Faces as ToroidFaces,
    VertexCount as ToroidVertexCount,
} from "./test_data/PentagonalToroid";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Grid3D Layer",
} as ComponentMeta<typeof SubsurfaceViewer>;

type NumberQuad = [number, number, number, number];

const Template: ComponentStory<typeof SubsurfaceViewer> = (args) => (
    <SubsurfaceViewer {...args} />
);

const defaultProps = {
    bounds: [456150, 5925800, 467400, 5939500] as NumberQuad,
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
const grid3dLayer = {
    "@@type": "Grid3DLayer",
    id: "Grid3DLayer",
    gridLines: true,
    material: true,
    colorMapName: "Rainbow",
    ZIncreasingDownwards: false,
};

const axes = {
    "@@type": "AxesLayer",
    id: "axes-layer2",
    bounds: [453150, 5925800, -2000, 469400, 5939500, 0],
    ZIncreasingDownwards: false,
};
const parameters = {
    docs: {
        description: {
            story: "Simgrid.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const Simgrid = Template.bind({});
Simgrid.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [
        axes,
        {
            ...grid3dLayer,
            pointsData: "vtk-grid/Simgrid_points.json",
            polysData: "vtk-grid/Simgrid_polys.json",
            propertiesData: "vtk-grid/Simgrid_scalar.json",
            pickable: true,
        },
    ],
};
Simgrid.parameters = parameters;

export const SimgridArrayInput = Template.bind({});
SimgridArrayInput.args = {
    ...defaultProps,
    id: "grid-3darray",
    layers: [
        axes,
        {
            ...grid3dLayer,
            pointsData: [
                456063, 5935991, -1729, 456063, 5935991, -1731, 456138,
                5935861.518843642, -1727.820068359375, 456138.5, 5935861.5,
                -1726.3526611328125, 456193.90625, 5936066, -1730.7259521484375,
                456193.8825946293, 5936065.981075703, -1732.200439453125,
                456268.9375, 5935936.5, -1726.6915283203125,
            ],
            polysData: [4, 0, 1, 2, 3, 4, 0, 4, 5, 1, 4, 0, 3, 6, 4],
            propertiesData: [0.2, 0.6, 0.8],
            pickable: true,
        },
    ],
};
SimgridArrayInput.parameters = parameters;

export const Simgrid2x = Template.bind({});
Simgrid2x.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [
        axes,
        {
            ...grid3dLayer,
            pointsData: "vtk-grid/Simgrid2x_points.json",
            polysData: "vtk-grid/Simgrid2x_polys.json",
            propertiesData: "vtk-grid/Simgrid2x_scalar.json",
            pickable: true,
        },
    ],
};
Simgrid2x.parameters = parameters;

export const Simgrid4x = Template.bind({});
Simgrid4x.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [
        axes,
        {
            ...grid3dLayer,
            ZIncreasingDownwards: false,
            pointsData: "vtk-grid/Simgrid4x_points.json",
            polysData: "vtk-grid/Simgrid4x_polys.json",
            propertiesData: "vtk-grid/Simgrid4x_scalar.json",
            pickable: true,
        },
    ],
};
Simgrid4x.parameters = parameters;

export const Simgrid8xIJonly = Template.bind({});
Simgrid8xIJonly.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [
        axes,
        {
            ...grid3dLayer,
            pointsData: "vtk-grid/Simgrid8xIJonly_points.json",
            polysData: "vtk-grid/Simgrid8xIJonly_polys.json",
            propertiesData: "vtk-grid/Simgrid8xIJonly_scalar.json",
            pickable: true,
        },
    ],
};
Simgrid8xIJonly.parameters = parameters;

const math = create(all, { randomSeed: "1984" });
const randomFunc = math?.random ? math.random : Math.random;

const snubCubePoints = SnubCubePoints.map((v) => 10 * v);
const snubCubeProperties = Array(SnubCubeVertexCount)
    .fill(0)
    .map(() => randomFunc() * 50);

const toroidPoints = ToroidPoints.map((v) => 10 * v).map((v, index) =>
    index % 3 === 0 ? v + 30 : v
);
const toroidProperties = Array(ToroidVertexCount)
    .fill(0)
    .map(() => randomFunc() * 10);

export const PolyhedralCells = Template.bind({});
PolyhedralCells.args = {
    bounds: [-25, -25, 50, 30] as NumberQuad,
    views: {
        layout: [1, 1] as [number, number],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
    id: "grid-3d-polyhedral-cell",
    layers: [
        {
            ...axes,
            id: "polyhedral-cells-axes",
            bounds: [-15, -15, -15, 40, 20, 15],
        },
        {
            ...grid3dLayer,
            id: "polyhedral1",
            coloringMode: TGrid3DColoringMode.Y,
            pickable: true,
            pointsData: snubCubePoints,
            polysData: SnubCubeFaces,
            propertiesData: snubCubeProperties,
            colorMapRange: [-8, 8],
            colorMapClampColor: [200, 200, 200],
            colorMapName: "Porosity",
        },
        {
            ...grid3dLayer,
            id: "polyhedral2",
            pickable: true,
            pointsData: toroidPoints,
            polysData: ToroidFaces,
            propertiesData: toroidProperties,
            coloringMode: TGrid3DColoringMode.Property,
        },
    ],
};
PolyhedralCells.parameters = parameters;

export const PolyhedralCellsTypedArrayInput = Template.bind({});

PolyhedralCellsTypedArrayInput.args = {
    bounds: [-25, -25, 50, 30] as NumberQuad,
    views: {
        layout: [1, 1] as [number, number],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
    id: "grid-3d-polyhedral-cell-typed-input",
    layers: [
        {
            ...axes,
            id: "polyhedral-cells-axes-typed-input",
            bounds: [-15, -15, -15, 40, 20, 15],
        },
        {
            ...grid3dLayer,
            id: "polyhedral1-typed-input",
            coloringMode: TGrid3DColoringMode.X,
            pickable: true,
            pointsData: new Float32Array(snubCubePoints),
            polysData: new Uint32Array(SnubCubeFaces),
            propertiesData: new Float32Array(snubCubeProperties),
            colorMapRange: [-8, 8],
            colorMapClampColor: [200, 200, 200],
            colorMapName: "Rainbow",
        },
        {
            ...grid3dLayer,
            id: "polyhedral2-typed-input",
            pickable: true,
            pointsData: new Float32Array(toroidPoints),
            polysData: new Uint32Array(ToroidFaces),
            propertiesData: new Float32Array(toroidProperties),
            coloringMode: TGrid3DColoringMode.Property,
        },
    ],
    typedArraySupport: true,
};
PolyhedralCells.parameters = parameters;
