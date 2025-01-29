import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import SubsurfaceViewer, { TGrid3DColoringMode } from "../../SubsurfaceViewer";

import {
    Points as SnubCubePoints,
    Faces as SnubCubeFaces,
    VertexCount as SnubCubeVertexCount,
} from "../../layers/grid3d/test_data/TruncatedSnubCube";

import {
    Points as ToroidPoints,
    Faces as ToroidFaces,
    VertexCount as ToroidVertexCount,
} from "../../layers/grid3d/test_data/PentagonalToroid";

import * as gridPoints from "../../layers/grid3d/test_data/DiscreteProperty/Points.json";
import * as gridPolys from "../../layers/grid3d/test_data/DiscreteProperty/Polys.json";
import * as gridProps from "../../layers/grid3d/test_data/DiscreteProperty/Props.json";

import { default3DViews, defaultStoryParameters } from "../sharedSettings";
import {
    createMathWithSeed,
    replaceNonJsonArgs,
} from "../sharedHelperFunctions";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Grid3D Layer",
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

type NumberQuad = [number, number, number, number];

const defaultProps = {
    bounds: [456150, 5925800, 467400, 5939500] as NumberQuad,
    views: default3DViews,
};

// Grid 3d story
const grid3dLayer = {
    "@@type": "Grid3DLayer",
    id: "Grid3DLayer",
    gridLines: true,
    material: true,
    colorMapName: "Rainbow",
    ZIncreasingDownwards: true,
    pickable: true,
};

const axes = {
    "@@type": "AxesLayer",
    id: "axes-layer2",
    bounds: [453150, 5925800, -2000, 469400, 5939500, 0],
    ZIncreasingDownwards: false,
};
const parameters = {
    docs: {
        ...defaultStoryParameters,
        description: {
            story: "Simgrid.",
        },
    },
};

// ---------In-place data generation--------------- //
function simpleGeometry(
    cellCountU: number,
    cellCountV: number,
    size?: [number, number]
) {
    const points: number[][] = [];
    const polygons: number[] = [];
    if (cellCountU <= 0 || cellCountV <= 0) {
        return { points, polygons, size: [0, 0] };
    }
    // convert to number of points
    const nu = cellCountU + 1;
    const nv = cellCountV + 1;
    const [xmin, xmax] = [-(size?.[0] ?? 100) / 2, (size?.[0] ?? 100) / 2];
    const dx = (xmax - xmin) / cellCountU;
    const [ymin, ymax] = [
        -(size?.[1] ?? cellCountV * dx) / 2,
        (size?.[1] ?? cellCountV * dx) / 2,
    ];
    const dy = (ymax - ymin) / cellCountV;
    let index = 0;
    for (let j = 0; j < nv; j++) {
        for (let i = 0; i < nu; i++) {
            points.push([xmin + i * dx, ymin + j * dy, 0]);
            if (i < nu - 1 && j < nv - 1) {
                polygons.push(4, index, index + 1, index + nu + 1, index + nu);
            }
            index++;
        }
    }
    return { points, polygons, size: [cellCountU, cellCountV] };
}

function continuousProperty(cellCountU: number, cellCountV: number) {
    const values: number[] = [];
    for (let i = 0; i < cellCountU; i++) {
        for (let j = 0; j < cellCountV; j++) {
            const value =
                Math.sin((i / cellCountU) * Math.PI * 2) +
                Math.cos((j / cellCountV) * Math.PI * 2);
            values.push(value);
        }
    }
    return values;
}

/** Discrete properties are expected to be continuous integers starting from 0. */
function discreteProperty(cellCountU: number, cellCountV: number) {
    const max = propertyValueNames.length - 1;
    const values = continuousProperty(cellCountU, cellCountV);
    for (let i = 0; i < values.length; i++) {
        // continuous properties are between -2 and 2, thus they must be divided by 2
        values[i] = Math.round(Math.abs(values[i] / 2) * max);
    }
    return values;
}

/* eslint-disable prettier/prettier */
const CATEGORICAL_COLOR_TABLE: [number, number, number][] = [
    [0, 0, 255], // 0
    [0, 255, 0], // 1
    [0, 255, 255], // 2
    [255, 0, 0], // 3
    [255, 0, 255], // 4
    [255, 255, 0], // 5
    [0, 0, 100], // 6
    [0, 100, 0], // 7
    [0, 100, 100], // 8
    [100, 0, 0], // 9
    [100, 0, 100], // 10
    [100, 100, 0], // 11
    [100, 100, 255], // 12
];

const propertyValueNames = [
    { value: 1, name: "blue" }, // 0
    { value: 2, name: "green" }, // 1
    { value: 5, name: "cyan" }, // 2
    { value: 6, name: "red" }, // 3
    { value: -8, name: "magenta" }, // 4
    { value: 9, name: "yellow" }, // 5
    { value: 20, name: "dark blue" }, // 6
    { value: 30, name: "dark green" }, // 7
    { value: 15, name: "dark cyan" }, // 8
    { value: 10, name: "dark red" }, // 9
    { value: 3, name: "dark magenta" }, // 10
    { value: -10, name: "dark yellow" }, // 11
    { value: -10, name: "Lite blue" }, // 12
];
/* eslint-enable prettier/prettier */

const CATEGORICAL_COLOR_MAP = (value: number) => CATEGORICAL_COLOR_TABLE[value];

const BLUE_RED_HEAT_MAP = (value: number): [number, number, number] => {
    return [value * 255, 0, (1 - value) * 255];
};

const SIMPLE_GEOMETRY = simpleGeometry(20, 10);
const SIMPLE_CONTINUOUS_PROP = continuousProperty(
    SIMPLE_GEOMETRY.size[0],
    SIMPLE_GEOMETRY.size[1]
);
const SIMPLE_DISCRETE_PROP = discreteProperty(
    SIMPLE_GEOMETRY.size[0],
    SIMPLE_GEOMETRY.size[1]
);

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const simpleContinuousLayerId = "simple_continuous_props";
const simpleDiscreteLayerId = "simple_discrete_props";
const discretePropsLayerId = "discrete_props";
const discretePropsColorfuncLayerId = "discrete_props_colorfunc";
const zPaintingLayerId = "z_painting";

const nonJsonLayerArgs = {
    [simpleContinuousLayerId]: {
        pointsData: new Float32Array(SIMPLE_GEOMETRY.points.flat()),
        polysData: new Uint32Array(SIMPLE_GEOMETRY.polygons),
        propertiesData: new Float32Array(SIMPLE_CONTINUOUS_PROP),
        colorMapFunction: BLUE_RED_HEAT_MAP,
    },
    [simpleDiscreteLayerId]: {
        pointsData: new Float32Array(SIMPLE_GEOMETRY.points.flat()),
        polysData: new Uint32Array(SIMPLE_GEOMETRY.polygons),
        propertiesData: new Float32Array(SIMPLE_DISCRETE_PROP),
        colorMapFunction: CATEGORICAL_COLOR_MAP,
    },
    [discretePropsLayerId]: {
        pointsData: new Float32Array(gridPoints),
        polysData: new Uint32Array(gridPolys),
        propertiesData: new Uint16Array(gridProps),
        colorMapFunction: new Uint8Array(CATEGORICAL_COLOR_TABLE.flat()),
    },
    [discretePropsColorfuncLayerId]: {
        pointsData: new Float32Array(gridPoints),
        polysData: new Uint32Array(gridPolys),
        propertiesData: new Uint16Array(gridProps),
        // The function should convert color indices to RGB values.
        // The property values are ranging from 0 to 12.
        colorMapFunction: (v: number) => {
            return [24 * v, 0, 24 * (12 - v)];
        },
    },
    [zPaintingLayerId]: {
        pointsData: new Float32Array(gridPoints),
        polysData: new Uint32Array(gridPolys),
    },
};

const SIMPLE_GEOMETRY_LAYER = {
    ...grid3dLayer,
    "@@typedArraySupport": true,
    pointsData: nonJsonLayerArgs[simpleContinuousLayerId].pointsData,
    polysData: nonJsonLayerArgs[simpleContinuousLayerId].polysData,
    gridLines: SIMPLE_GEOMETRY.points.length < 1000,
};

const SIMPLE_CONTINUOUS_LAYER = {
    ...SIMPLE_GEOMETRY_LAYER,
    id: simpleContinuousLayerId,
    propertiesData: nonJsonLayerArgs[simpleContinuousLayerId].propertiesData,
    colorMapFunction:
        nonJsonLayerArgs[simpleContinuousLayerId].colorMapFunction,
    colorMapClampColor: true,
    colorMapRange: [-2, 2],
};

const SIMPLE_DISCRETE_LAYER = {
    ...SIMPLE_GEOMETRY_LAYER,
    id: simpleDiscreteLayerId,
    coloringMode: TGrid3DColoringMode.DiscreteProperty,
    propertiesData: nonJsonLayerArgs[simpleDiscreteLayerId].propertiesData,
    discretePropertyValueNames: propertyValueNames,
    colorMapFunction: nonJsonLayerArgs[simpleDiscreteLayerId].colorMapFunction,
    colorMapClampColor: true,
    colorMapRange: [0, 12],
};

export const Simgrid: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        id: "grid-3d",
        layers: [
            axes,
            {
                ...grid3dLayer,
                ZIncreasingDownwards: false,
                pointsData: "vtk-grid/Simgrid_points.json",
                polysData: "vtk-grid/Simgrid_polys.json",
                propertiesData: "vtk-grid/Simgrid_scalar.json",
                pickable: true,
            },
        ],
    },
    parameters: parameters,
};

export const SimgridArrayInput: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        bounds: [456169, 5936050, 456185, 5936055],
        id: "grid-3darray",
        layers: [
            axes,
            {
                ...grid3dLayer,
                ZIncreasingDownwards: false,
                pointsData: [
                    456063, 5935991, -1729, 456063, 5935991, -1731, 456138,
                    5935861.518843642, -1727.820068359375, 456138.5, 5935861.5,
                    -1726.3526611328125, 456193.90625, 5936066,
                    -1730.7259521484375, 456193.8825946293, 5936065.981075703,
                    -1732.200439453125, 456268.9375, 5935936.5,
                    -1726.6915283203125,
                ],
                polysData: [4, 0, 1, 2, 3, 4, 0, 4, 5, 1, 4, 0, 3, 6, 4],
                propertiesData: [0.2, 0.6, 0.8],
            },
        ],
    },
    parameters: parameters,
};

export const Simgrid2x: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        id: "grid-3d",
        layers: [
            axes,
            {
                ...grid3dLayer,
                ZIncreasingDownwards: false,
                pointsData: "vtk-grid/Simgrid2x_points.json",
                polysData: "vtk-grid/Simgrid2x_polys.json",
                propertiesData: "vtk-grid/Simgrid2x_scalar.json",
            },
        ],
    },
    parameters: parameters,
};

export const Simgrid4x: StoryObj<typeof SubsurfaceViewer> = {
    args: {
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
            },
        ],
    },
    parameters: parameters,
};

export const Simgrid8xIJonly: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        id: "grid-3d",
        layers: [
            axes,
            {
                ...grid3dLayer,
                ZIncreasingDownwards: false,
                pointsData: "vtk-grid/Simgrid8xIJonly_points.json",
                polysData: "vtk-grid/Simgrid8xIJonly_polys.json",
                propertiesData: "vtk-grid/Simgrid8xIJonly_scalar.json",
            },
        ],
    },
    parameters: parameters,
};

const math = createMathWithSeed("1984");

const snubCubePoints = SnubCubePoints.map((v) => 10 * v);
const snubCubeProperties = Array(SnubCubeVertexCount)
    .fill(0)
    .map(() => 100 + math.random() * 50);

const toroidPoints = ToroidPoints.map((v) => 10 * v).map((v, index) =>
    index % 3 === 0 ? v + 30 : v
);
const toroidProperties = Array(ToroidVertexCount)
    .fill(0)
    .map(() => math.random() * 10);

export const PolyhedralCells: StoryObj<typeof SubsurfaceViewer> = {
    args: {
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
                pointsData: snubCubePoints,
                polysData: SnubCubeFaces,
                propertiesData: snubCubeProperties,
                colorMapName: "Porosity",
            },
            {
                ...grid3dLayer,
                id: "polyhedral2",
                pointsData: toroidPoints,
                polysData: ToroidFaces,
                propertiesData: toroidProperties,
                coloringMode: TGrid3DColoringMode.Property,
            },
        ],
    },
    parameters: parameters,
};

export const ContinuousProperty: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "grid-property",
        layers: [
            {
                ...axes,
                bounds: [-100, -100, -100, 100, 100, 100],
            },
            SIMPLE_CONTINUOUS_LAYER,
        ],
    },
    parameters: parameters,
    render: (args) => (
        <SubsurfaceViewer {...replaceNonJsonArgs(args, nonJsonLayerArgs)} />
    ),
};

export const DiscreteProperty: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "grid-property",
        layers: [
            {
                ...axes,
                bounds: [-100, -100, -100, 100, 100, 100],
            },
            SIMPLE_DISCRETE_LAYER,
        ],
    },
    parameters: parameters,
    render: (args) => (
        <SubsurfaceViewer {...replaceNonJsonArgs(args, nonJsonLayerArgs)} />
    ),
};

export const DiscretePropertyWithClamping: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        bounds: [-2500, -2500, 2500, 2500] as NumberQuad,
        views: {
            layout: [1, 1] as [number, number],
            viewports: [
                {
                    id: "view_1",
                    show3D: true,
                },
            ],
        },
        id: "grid-3d-discrete_props",
        layers: [
            {
                ...axes,
                id: "discrete_props-axes",
                bounds: [-2000, -2200, -2200, 2200, 2000, -1000],
            },
            {
                ...grid3dLayer,
                "@@typedArraySupport": true,
                id: discretePropsLayerId,
                coloringMode: TGrid3DColoringMode.DiscreteProperty,
                pointsData: nonJsonLayerArgs[discretePropsLayerId].pointsData,
                polysData: nonJsonLayerArgs[discretePropsLayerId].polysData,
                propertiesData:
                    nonJsonLayerArgs[discretePropsLayerId].propertiesData,
                discretePropertyValueNames: propertyValueNames,
                colorMapName: "Seismic",
                colorMapFunction:
                    nonJsonLayerArgs[discretePropsLayerId].colorMapFunction,
                material: {
                    ambient: 0.5,
                    diffuse: 0.5,
                    shininess: 32,
                    specularColor: [255, 255, 255],
                },
                colorMapRange: [3, 8],
                colorMapClampColor: [100, 100, 100],
            },
        ],
    },
    parameters: parameters,
    render: (args) => (
        <SubsurfaceViewer {...replaceNonJsonArgs(args, nonJsonLayerArgs)} />
    ),
};

export const DiscretePropertyWithColorFuncAndClamping: StoryObj<
    typeof SubsurfaceViewer
> = {
    args: {
        bounds: [-2500, -2500, 2500, 2500] as NumberQuad,
        views: {
            layout: [1, 1] as [number, number],
            viewports: [
                {
                    id: "view_1",
                    show3D: true,
                },
            ],
        },
        id: "grid-3d-discrete_props",
        layers: [
            {
                ...axes,
                id: "discrete_props-axes",
                bounds: [-2000, -2200, -2200, 2200, 2000, -1000],
            },
            {
                ...grid3dLayer,
                "@@typedArraySupport": true,
                id: discretePropsColorfuncLayerId,
                coloringMode: TGrid3DColoringMode.DiscreteProperty,
                pointsData:
                    nonJsonLayerArgs[discretePropsColorfuncLayerId].pointsData,
                polysData:
                    nonJsonLayerArgs[discretePropsColorfuncLayerId].polysData,
                propertiesData:
                    nonJsonLayerArgs[discretePropsColorfuncLayerId]
                        .propertiesData,
                colorMapFunction:
                    nonJsonLayerArgs[discretePropsColorfuncLayerId]
                        .colorMapFunction,
                material: false,
                colorMapRange: [3, 10],
                colorMapClampColor: [100, 100, 100],
            },
        ],
    },
    parameters: parameters,
    render: (args) => (
        <SubsurfaceViewer {...replaceNonJsonArgs(args, nonJsonLayerArgs)} />
    ),
};

export const DiscretePropertyWithUndefinedValues: StoryObj<
    typeof SubsurfaceViewer
> = {
    args: {
        bounds: [-2500, -2500, 2500, 2500] as NumberQuad,
        views: {
            layout: [1, 1] as [number, number],
            viewports: [
                {
                    id: "view_1",
                    show3D: true,
                },
            ],
        },
        id: "grid-3d-discrete-props-undef-vals",
        layers: [
            {
                ...axes,
                id: "discrete-props-undef-vals-axes",
                bounds: [-2000, -2200, -2200, 2200, 2000, -1000],
            },
            {
                ...grid3dLayer,
                "@@typedArraySupport": true,
                id: discretePropsLayerId,
                coloringMode: TGrid3DColoringMode.DiscreteProperty,
                colorMapFunction:
                    nonJsonLayerArgs[discretePropsLayerId].colorMapFunction,
                discretePropertyValueNames: propertyValueNames,
                pointsData: nonJsonLayerArgs[discretePropsLayerId].pointsData,
                polysData: nonJsonLayerArgs[discretePropsLayerId].polysData,
                propertiesData:
                    nonJsonLayerArgs[discretePropsLayerId].propertiesData,
                material: {
                    ambient: 0.5,
                    diffuse: 0.5,
                    shininess: 32,
                    specularColor: [255, 255, 255],
                },
                undefinedPropertyValue: 4,
                undefinedPropertyColor: [204, 204, 204],
            },
        ],
    },
    parameters: parameters,
    render: (args) => (
        <SubsurfaceViewer {...replaceNonJsonArgs(args, nonJsonLayerArgs)} />
    ),
};

export const ZPainting: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        bounds: [-2500, -2500, 2500, 2500] as NumberQuad,
        views: {
            layout: [1, 1] as [number, number],
            viewports: [
                {
                    id: "view_1",
                    show3D: true,
                },
            ],
        },
        id: "grid-3d-Z_props",
        layers: [
            {
                ...axes,
                id: "discrete_props-axes",
                bounds: [-2000, -2200, -2200, 2200, 2000, -1000],
            },
            {
                ...grid3dLayer,
                "@@typedArraySupport": true,
                id: zPaintingLayerId,
                pointsData: nonJsonLayerArgs[zPaintingLayerId].pointsData,
                polysData: nonJsonLayerArgs[zPaintingLayerId].polysData,
                colorMapName: "Seismic",
                coloringMode: TGrid3DColoringMode.Z,
                //colorMapFunction: "rainbow",
                material: {
                    ambient: 0.5,
                    diffuse: 0.5,
                    shininess: 32,
                    specularColor: [255, 255, 255],
                },
                colorMapRange: [-1850, -1700],
                colorMapClampColor: [0, 250, 0],
            },
        ],
    },
    parameters: parameters,
    render: (args) => (
        <SubsurfaceViewer {...replaceNonJsonArgs(args, nonJsonLayerArgs)} />
    ),
};
