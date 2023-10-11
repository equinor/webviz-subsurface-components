import type { SyntheticEvent } from "react";
import React from "react";
import { styled } from "@mui/material/styles";
import type { ViewsType } from "../../components/Map";
import { useHoverInfo } from "../../components/Map";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import InfoCard from "../../components/InfoCard";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { Slider } from "@mui/material";
import {
    ContinuousLegend,
    ColorLegend,
    createColorMapFunction,
} from "@emerson-eps/color-tables";
import Axes2DLayer from "../axes2d/axes2DLayer";
import AxesLayer from "../axes/axesLayer";
import MapLayer from "./mapLayer";
import { ViewFooter } from "../../components/ViewFooter";
import { View } from "@deck.gl/core/typed";
import type { colorMapFunctionType } from "../utils/layerTools";

const PREFIX = "MapLayer3dPng";

const classes = {
    main: `${PREFIX}-main`,
    legend: `${PREFIX}-legend`,
};

const Root = styled("div")({
    [`& .${classes.main}`]: {
        height: 500,
        border: "1px solid black",
        position: "relative",
    },
    [`& .${classes.legend}`]: {
        width: 100,
        position: "absolute",
        top: "0",
        right: "0",
    },
});

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Map Layer",
} as ComponentMeta<typeof SubsurfaceViewer>;

type NumberQuad = [number, number, number, number];

const valueRange = [-3071, 41048];

const defaultMapLayerProps = {
    id: "default_map",
    meshData: "hugin_depth_25_m.float32",
    frame: {
        origin: [432150, 6475800] as [number, number],
        count: [291, 229] as [number, number],
        increment: [25, 25] as [number, number],
        rotDeg: 0,
    },
    propertiesData: "kh_netmap_25_m.float32",
    ZIncreasingDownwards: true,
};

const defaultMapLayer = new MapLayer({ ...defaultMapLayerProps });

const wellsLayer = {
    "@@type": "WellsLayer",
    id: "wells-layer",
    data: "./volve_wells.json",
    logData: "./volve_logs.json",
    logrunName: "BLOCKING",
    logName: "ZONELOG",
    logColor: "Stratigraphy",
};

// Example using "Map" layer. Uses float32 mesh and properties binary arrays. Not PNG.
const meshMapLayerBig = {
    "@@type": "MapLayer",
    id: "mesh-layer",
    meshUrl: "hugin_depth_5_m.float32",
    frame: {
        origin: [432150, 6475800],
        count: [1451, 1141],
        increment: [5, 5],
        rotDeg: 0,
    },
    propertiesUrl: "kh_netmap_5_m.float32",
    contours: [0, 100],
    isContoursDepth: true,
    gridLines: false,
    material: true,
    colorMapName: "Physics",
};

// Small test map. 4 by 5 cells. One inactive node => 4 inactive cells.
// property values and depth values both from 0 to 29.
// Useful for debugging.
const smallLayer = {
    "@@type": "MapLayer",
    id: "mesh-layer",
    meshUrl: "small_depths.float32",
    frame: {
        origin: [459840.7, 5929826.1],
        count: [5, 6],
        increment: [175, 150],
        rotDeg: 0,
    },
    propertiesUrl: "small_properties.float32",
    gridLines: true,
    material: false,
    // black to white colors.
    colorMapFunction: (value: number) => [
        value * 255,
        value * 255,
        value * 255,
    ],
    colorMapRange: [0, 29],
    colorMapClampColor: [255, 0, 0],
};

// This layer has as many property values as depth values hence each cell will be interpolated in color.
const nodeCenteredPropertiesLayer = {
    "@@type": "MapLayer",
    id: "node-centered-layer",

    meshUrl:
        "data:text/plain;base64,zczMP5qZ2T9mZuY/MzPzP5qZmT9mZqY/MzOzPwAAwD/NzEw/ZmZmPwAAgD/NzIw/zczMPgAAAD+amRk/MzMzPwAAAIDNzMw9zcxMPpqZmT4=",
    frame: {
        origin: [0, 0],
        count: [4, 5],
        increment: [1, 1],
        rotDeg: 0,
    },
    propertiesUrl:
        "data:text/plain;base64,ZmYmQM3MLEAzMzNAmpk5QM3MDEAzMxNAmpkZQAAAIEBmZuY/MzPzPwAAAEBmZgZAMzOzPwAAwD/NzMw/mpnZPwAAgD/NzIw/mpmZP2Zmpj8=",
    gridLines: true,
    material: true,
    // black to white colors.
    colorMapFunction: (value: number) => [
        value * 255,
        value * 255,
        value * 255,
    ],
};

const nodeCenteredPropertiesLayerWithArrayInput = {
    "@@type": "MapLayer",
    id: "node-centered-layer",
    frame: {
        origin: [0, 0],
        count: [4, 5],
        increment: [1, 1],
        rotDeg: 0,
    },
    meshData: Array.from(Array(20)).map(() => Math.random()), // Array of 20 random numbers
    propertiesData: Array.from(Array(20)).map(() => Math.random()),
    gridLines: true,
    material: true,
    // black to white colors.
    colorMapFunction: (value: number) => [
        value * 255,
        value * 255,
        value * 255,
    ],
};

// This layer has as (nx-1)*(ny-1) property values and depth values are nx*ny hence each cell will be fixed in color.
const cellCenteredPropertiesLayer = {
    "@@type": "MapLayer",
    id: "cell-centered-layer",

    /*eslint-disable */
    // One depth pr node
    meshData: [
        1.6, 1.7, 1.8, 1.9,
        1.2, 1.3, 1.4, 1.5,
        0.8, 0.9, 1.0, 1.1,
        0.4, 0.5, 0.6, 0.7,
        0.0, 0.1, 0.2, 0.3 ],

    // One property pr cell.
    propertiesData: [0.9,  1.0,  1.1, 
                     0.6,  undefined,  0.8,
                     0.3,  0.4,  0.5, 
                     0.0,  0.1,  0.2],
    /*eslint-enable */

    frame: {
        origin: [0, 0],
        count: [4, 5],
        increment: [1, 1],
        rotDeg: 0,
    },

    gridLines: true,
    material: true,
    // black to white colors.
    colorMapFunction: (value: number) => [
        value * 255,
        value * 255,
        value * 255,
    ],
    smoothShading: true,
};

// Example using "Map" layer. Uses PNG float for mesh and properties.
const meshMapLayerPng = {
    "@@type": "MapLayer",
    id: "mesh-layer",
    meshUrl: "hugin_depth_25_m.png",
    frame: {
        origin: [432150, 6475800],
        count: [291, 229],
        increment: [25, 25],
        rotDeg: 0,
    },
    propertiesUrl: "kh_netmap_25_m.png",
    contours: [0, 100],
    isContoursDepth: true,
    gridLines: false,
    material: true,
    smoothShading: true,
    colorMapName: "Physics",
    ZIncreasingDownwards: true,
};

// Example using "Map" layer. Uses float32 float for mesh and properties.
const meshMapLayerFloat32 = {
    "@@type": "MapLayer",
    id: "mesh-layer",
    meshUrl: "hugin_depth_25_m.float32",
    frame: {
        origin: [432150, 6475800],
        count: [291, 229],
        increment: [25, 25],
        rotDeg: 0,
    },
    propertiesUrl: "kh_netmap_25_m.float32",
    contours: [0, 100],
    isContoursDepth: true,
    gridLines: false,
    material: false,
    colorMapName: "Physics",
};

// Example rotated layer
const meshMapLayerRotated = {
    "@@type": "MapLayer",
    id: "mesh-layer",
    meshUrl: "hugin_depth_25_m.float32",
    frame: {
        origin: [432150, 6475800],
        count: [291, 229],
        increment: [25, 25],
        rotDeg: 30,
        //rotPoint: [436000, 6478000],
    },
    propertiesUrl: "kh_netmap_25_m.float32",
    contours: [0, 100],
    isContoursDepth: true,
    material: false,
    colorMapName: "Physics",
};

const axes_hugin = {
    "@@type": "AxesLayer",
    id: "axes-layer2",
    bounds: [432150, 6475800, 2000, 439400, 6481500, 3500],
};

const north_arrow_layer = {
    "@@type": "NorthArrow3DLayer",
    id: "north-arrow-layer",
};

const defaultArgs = {
    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
};

const defaultParameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
    },
};

function gradientColorMap(x: number) {
    return [255 - x * 255, 255 - x * 100, 255 * x];
}

function nearestColorMap(x: number) {
    if (x > 0.5) return [100, 255, 255];
    else if (x > 0.1) return [255, 100, 255];
    return [255, 255, 100];
}

function breakpointColorMap(x: number, breakpoint: number) {
    if (x > breakpoint) return [0, 50, 200];
    return [255, 255, 0];
}

function createColorMap(breakpoint: number) {
    return (value: number) => breakpointColorMap(value, breakpoint);
}

export const MapLayer3dPng: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

MapLayer3dPng.args = {
    id: "map",
    layers: [axes_hugin, meshMapLayerPng, north_arrow_layer],

    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

MapLayer3dPng.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using png as mesh and properties data.",
        },
    },
};

export const MapLayer3dPngNoBounds: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

MapLayer3dPngNoBounds.args = {
    id: "map",
    layers: [axes_hugin, meshMapLayerPng, north_arrow_layer],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

MapLayer3dPngNoBounds.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "If no bounds are specified will results in automatically calcultated camera. Will look at center of bounding box of the data",
        },
    },
};

export const ConstantColor: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

ConstantColor.args = {
    id: "map",
    layers: [
        axes_hugin,
        {
            ...meshMapLayerPng,
            colorMapFunction: [0, 255, 0], // Use constant color instead of function
        },
        north_arrow_layer,
    ],

    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

ConstantColor.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: 'Example using the property "colorMapFunction" to color the surface in one color only',
        },
    },
};

export const ScaleZ: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    const [layers, setLayers] = React.useState([
        axes_hugin,
        meshMapLayerPng,
        north_arrow_layer,
    ]);

    const handleChange = () => {
        setLayers([axes_hugin, meshMapLayerPng, wellsLayer, north_arrow_layer]);
    };

    const props = {
        ...args,
        layers,
    };

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...props} />
            </div>
            <button onClick={handleChange}> Add layer </button>
        </Root>
    );
};

ScaleZ.args = {
    id: "ScaleZ",
    layers: [axes_hugin, meshMapLayerPng, wellsLayer, north_arrow_layer],
    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,

    views: {
        layout: [1, 2],
        viewports: [
            {
                id: "view_1",
                layerIds: ["axes-layer2", "mesh-layer", "north-arrow-layer"],
                show3D: true,
                isSync: true,
            },
            {
                id: "view_2",
                layerIds: ["axes-layer2", "wells-layer", "north-arrow-layer"],
                show3D: true,
                isSync: true,
            },
        ],
    },
};

ScaleZ.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example scaling in z direction using arrow up/down buttons.",
        },
    },
};

export const ResetCameraProperty: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    const [home, setHome] = React.useState<number>(0);
    const [camera, setCamera] = React.useState({
        rotationOrbit: 0,
        rotationX: 45,
        target: [435775, 6477650, -1750],
        zoom: -3.8,
    });

    const handleChange1 = () => {
        setHome(home + 1);
    };

    const handleChange2 = () => {
        setCamera({ ...camera, rotationOrbit: camera.rotationOrbit + 5 });
    };

    const props = {
        ...args,
        cameraPosition: camera,
        triggerHome: home,
    };

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...props} />
            </div>
            <button onClick={handleChange1}> Reset Camera to bounds</button>
            <button onClick={handleChange2}> Change Camera </button>
        </Root>
    );
};

ResetCameraProperty.args = {
    id: "ResetCameraProperty",
    layers: [axes_hugin, meshMapLayerPng, north_arrow_layer],

    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
    cameraPosition: {
        rotationOrbit: 0,
        rotationX: 80,
        target: [435775, 6478650, -1750],
        zoom: -3.5109619192773796,
    },
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

ResetCameraProperty.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: `Example using optional 'triggerHome' property.
                    When this property is changed camera will reset to home position.
                    Using the button the property will change its value.`,
        },
    },
};

export const AddLayer: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    const [layers, setLayers] = React.useState([
        axes_hugin,
        meshMapLayerPng,
        north_arrow_layer,
    ]);

    const handleChange = () => {
        setLayers([axes_hugin, meshMapLayerPng, wellsLayer, north_arrow_layer]);
    };

    const props = {
        ...args,
        layers,
    };

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...props} />
            </div>
            <button onClick={handleChange}> Add layer </button>
        </Root>
    );
};

AddLayer.args = {
    id: "map",

    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

AddLayer.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: `Example using button to add a layer.`,
        },
    },
};

export const MapLayer2d: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

const axesLayer2D = new Axes2DLayer({
    id: "axesLayer2D",
    backgroundColor: [0, 255, 255],
});

const mapLayer = new MapLayer({
    id: "MapLayer",
    meshUrl: "hugin_depth_25_m.float32",
    frame: {
        origin: [432150, 6475800],
        count: [291, 229],
        increment: [25, 25],
        rotDeg: 0,
    },
    propertiesUrl: "kh_netmap_25_m.float32",
    contours: [0, 100],
    isContoursDepth: true,
    gridLines: false,
    material: true,
    colorMapName: "Physics",
});

MapLayer2d.args = {
    id: "map",
    layers: [mapLayer, axesLayer2D],
    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: false,
            },
        ],
    },
};

MapLayer2d.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using png as mesh and properties data.",
        },
    },
};

export const MapLayer2dDarkMode: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

const white = [255, 255, 255, 255];

MapLayer2dDarkMode.args = {
    id: "map",
    layers: [
        { ...axes_hugin, labelColor: white, axisColor: white },
        { ...meshMapLayerFloat32, material: false, gridLines: false },
        { ...north_arrow_layer, color: white },
    ],
    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
    scale: {
        visible: true,
        cssStyle: { color: "white" },
    },
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: false,
            },
        ],
    },
};

MapLayer2dDarkMode.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using png as mesh and properties data.",
        },
    },
    backgrounds: { default: "dark" },
};

export const Rotated: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

Rotated.args = {
    id: "map",
    layers: [axes_hugin, meshMapLayerRotated, north_arrow_layer],
    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: false,
            },
        ],
    },
};

Rotated.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using png as mesh and properties data.",
        },
    },
};

export const BigMap: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

BigMap.args = {
    id: "map",
    layers: [axes_hugin, meshMapLayerBig, north_arrow_layer],
    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
};

export const BigMap3d: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

BigMap3d.args = {
    id: "map",
    layers: [axes_hugin, meshMapLayerBig, north_arrow_layer],
    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

BigMap3d.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using large map with approx. 1400x1400 cells.",
        },
    },
};

const axes_small = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [459790, 5929776, 0, 460590, 5930626, 30],
};
export const SmallMap: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

SmallMap.args = {
    id: "map",
    layers: [axes_small, smallLayer, north_arrow_layer],
    bounds: [459840.7, 5929826.1, 460540.7, 5930576.1] as NumberQuad,
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

SmallMap.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "4x5 cells.",
        },
    },
};

const axes_lite = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [-1, -1, 0, 4, 5, 3],
};

//-- CellCenteredPropMap --
export const CellCenteredPropMap: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

CellCenteredPropMap.args = {
    id: "map",
    layers: [axes_lite, cellCenteredPropertiesLayer, north_arrow_layer],
    bounds: [-1, -1, 4, 5] as NumberQuad,
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

CellCenteredPropMap.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "A small map with properties given at cell centers. Each cell will be constant colored",
        },
    },
};

//-- NodeCenteredPropMap --
export const NodeCenteredPropMap: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

NodeCenteredPropMap.args = {
    id: "map",
    layers: [axes_lite, nodeCenteredPropertiesLayer, north_arrow_layer],
    bounds: [-1, -1, 4, 5] as NumberQuad,
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

NodeCenteredPropMap.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "A small map with properties given at nodes. Each cell will be interpolated in color.",
        },
    },
};

//-- NodeCenteredPropMap  with native javascript arrays as input --
export const NodeCenteredPropMapWithArrayInput: ComponentStory<
    typeof SubsurfaceViewer
> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

NodeCenteredPropMapWithArrayInput.args = {
    id: "map",
    layers: [
        axes_lite,
        nodeCenteredPropertiesLayerWithArrayInput,
        north_arrow_layer,
    ],
    bounds: [-1, -1, 4, 5] as NumberQuad,
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

NodeCenteredPropMapWithArrayInput.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Both mesh and property data given as native javascript arrays (as opposed to URL).",
        },
    },
};

function makeGaussian(amplitude, x0, y0, stdX, stdY) {
    return function (amplitude, x0, y0, stdX, stdY, x, y) {
        const exponent = -(
            Math.pow(x - x0, 2) / (2 * Math.pow(stdX, 2)) +
            Math.pow(y - y0, 2) / (2 * Math.pow(stdY, 2))
        );
        return amplitude * Math.pow(Math.E, exponent);
    }.bind(null, amplitude, x0, y0, stdX, stdY);
}

function makeData(n: number, amplitude: number): Float32Array {
    const X0 = 0;
    const Y0 = 0;
    const stdX = 75;
    const stdY = 50;
    const f = makeGaussian(amplitude, X0, Y0, stdX, stdY);

    const data = new Float32Array(n * n).map((val, index) => {
        const x = (index % n) - n / 2;
        const y = Math.floor(index / n) - n / 2;
        return f(x, y); // keep + 0.3 * Math.random();
    });

    return data;
}

//-- MapLayer with native javascript arrays as input --
const TypedArrayInputStory: ComponentStory<typeof SubsurfaceViewer> = (args: {
    dimension: number;
}) => {
    const subsurfaceViewerArgs = {
        id: "map",
        layers: [
            new MapLayer({
                frame: {
                    origin: [-args.dimension / 2, -args.dimension / 2],
                    count: [args.dimension, args.dimension],
                    increment: [1, 1],
                    rotDeg: 0,
                },
                meshData: makeData(args.dimension, 99),
                propertiesData: makeData(args.dimension, 1),
                gridLines: false,
                material: true,
                ZIncreasingDownwards: false,
                contours: [0, 5],
                colorMapFunction: nearestColorMap as colorMapFunctionType,
            }),
            new AxesLayer({
                ZIncreasingDownwards: false,
                bounds: [
                    -args.dimension / 2,
                    -args.dimension / 2,
                    -10,
                    args.dimension / 2,
                    args.dimension / 2,
                    60,
                ],
            }),
        ],
        cameraPosition: {
            rotationOrbit: 45,
            rotationX: 45,
            zoom: [-100, -100, -10, 100, 100, 60],
            target: [0, 0, 0],
        },
        views: {
            layout: [1, 1],
            viewports: [
                {
                    id: "view_1",
                    show3D: true,
                },
            ],
        },
    };
    return <SubsurfaceViewer {...subsurfaceViewerArgs} />;
};

export const TypedArrayInput: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <TypedArrayInputStory {...args} />;
};

TypedArrayInput.args = {
    dimension: 300,
};

TypedArrayInput.argTypes = {
    dimension: {
        options: 300,
        control: { type: "range", min: 150, max: 300, step: 1 },
    },
};

TypedArrayInput.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Both mesh and property data given as typed arrays arrays (as opposed to URL).",
        },
    },
};

export const GradientFunctionColorMap: ComponentStory<
    typeof SubsurfaceViewer
> = () => {
    const args = {
        ...defaultArgs,
        id: "gradient-color-map",
        layers: [
            { ...meshMapLayerFloat32, colorMapFunction: gradientColorMap },
        ],
    };
    return <SubsurfaceViewer {...args} />;
};

GradientFunctionColorMap.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using gradient color mapping function.",
        },
    },
};

export const StepFunctionColorMap: ComponentStory<
    typeof SubsurfaceViewer
> = () => {
    const args = {
        ...defaultArgs,
        id: "nearest-color-map",
        layers: [
            {
                ...meshMapLayerFloat32,
                material: true,
                colorMapFunction: nearestColorMap,
            },
        ],
    };

    return <SubsurfaceViewer {...args} />;
};

StepFunctionColorMap.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using step color mapping function.",
        },
    },
};

export const DefaultColorScale: ComponentStory<
    typeof SubsurfaceViewer
> = () => {
    const args = {
        ...defaultArgs,
        id: "default-color-scale",
        layers: [{ ...meshMapLayerFloat32 }],
    };

    return <SubsurfaceViewer {...args} />;
};

DefaultColorScale.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Default color scale.",
        },
    },
};

export const Readout: ComponentStory<typeof SubsurfaceViewer> = () => {
    const [hoverInfo, hoverCallback] = useHoverInfo();

    const args = React.useMemo(() => {
        return {
            ...defaultArgs,
            id: "readout",
            layers: [{ ...meshMapLayerFloat32 }],
            coords: {
                visible: false,
            },
            onMouseEvent: hoverCallback,
        };
    }, [hoverCallback]);

    return (
        <>
            <SubsurfaceViewer {...args} />
            {hoverInfo && <InfoCard pickInfos={hoverInfo} />}
        </>
    );
};

Readout.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Readout example.",
        },
    },
};

export const BigMapWithHole: ComponentStory<typeof SubsurfaceViewer> = () => {
    const [hoverInfo, hoverCallback] = useHoverInfo();

    const args = React.useMemo(() => {
        return {
            ...defaultArgs,
            id: "readout",
            layers: [
                {
                    ...meshMapLayerBig,
                    meshUrl: "hugin_depth_5_m_w_hole.float32",
                    gridLines: false,
                    material: false,
                },
            ],
            coords: {
                visible: false,
            },
            onMouseEvent: hoverCallback,
        };
    }, [hoverCallback]);

    return (
        <>
            <SubsurfaceViewer {...args} />
            {hoverInfo && <InfoCard pickInfos={hoverInfo} />}
        </>
    );
};

BigMapWithHole.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example of map with a hole.",
        },
    },
};

export const BreakpointColorMap: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    const [breakpoint, setBreakpoint] = React.useState<number>(0.5);

    const colorMap = React.useCallback(
        (value: number) => {
            return createColorMap(breakpoint)(value);
        },
        [breakpoint]
    );

    const layer = {
        ...args?.layers?.[0],
        colorMapFunction: colorMap,
    };

    const props = {
        ...args,
        layers: [layer],
    };

    const handleChange = React.useCallback(
        (_event: Event | SyntheticEvent, value: number | number[]) => {
            setBreakpoint((value as number) / 100);
        },
        []
    );

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...props} />
                <div className={classes.legend}>
                    <ContinuousLegend
                        min={valueRange[0]}
                        max={valueRange[1]}
                        colorMapFunction={colorMap}
                    />
                </div>
            </div>
            <Slider
                min={0}
                max={100}
                defaultValue={50}
                step={1}
                onChangeCommitted={handleChange}
            />
        </Root>
    );
};

BreakpointColorMap.args = {
    ...defaultArgs,
    id: "breakpoint-color-map",
    layers: [
        {
            ...meshMapLayerFloat32,
            gridLines: false,
            material: true,
        },
    ],
};

BreakpointColorMap.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using a color scale with a breakpoint.",
        },
    },
};

export const ColorMapRange: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    const [colorMapUpper, setColorMapUpper] = React.useState<number>(41048);

    const layer = {
        ...args?.layers?.[0],
        colorMapRange: [-3071, colorMapUpper],
    };

    const props = {
        ...args,
        layers: [layer],
    };

    const handleChange = React.useCallback(
        (_event: unknown, value: number | number[]) => {
            setColorMapUpper(value as number);
        },
        []
    );

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...props} />
            </div>
            <Slider
                min={10000}
                max={41048}
                defaultValue={41048}
                step={1000}
                onChange={handleChange}
            />
        </Root>
    );
};

ColorMapRange.args = {
    ...defaultArgs,
    id: "breakpoint-color-map",
    layers: [
        {
            ...meshMapLayerFloat32,
            colorMapName: "Seismic",
            colorMapClampColor: false,
            gridLines: false,
            material: true,
        },
    ],
};

ColorMapRange.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: 'Example changing the "ColorMapRange" property using a slider.',
        },
    },
};

// Map layer with color colorselector

const MapLayerColorSelectorTemplate: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    const [colorName, setColorName] = React.useState("Rainbow");
    const [colorRange, setRange] = React.useState();
    const [isAuto, setAuto] = React.useState();
    const [breakPoints, setBreakPoint] = React.useState();
    const [isLog, setIsLog] = React.useState(false);
    const [isNearest, setIsNearest] = React.useState(false);

    // user defined breakpoint(domain)
    const userDefinedBreakPoint = React.useCallback(
        (data: { colorArray: React.SetStateAction<undefined> }) => {
            if (data) setBreakPoint(data.colorArray);
        },
        []
    );

    // Get color name from color selector
    const colorNameFromSelector = React.useCallback(
        (data: React.SetStateAction<string>) => {
            setColorName(data);
        },
        []
    );

    // user defined range
    const userDefinedRange = React.useCallback(
        (data: {
            range: React.SetStateAction<undefined>;
            isAuto: React.SetStateAction<undefined>;
        }) => {
            if (data.range) setRange(data.range);
            setAuto(data.isAuto);
        },
        []
    );

    // Get interpolation method from color selector to layer
    const getInterpolateMethod = React.useCallback(
        (data: {
            isLog: boolean | ((prevState: boolean) => boolean);
            isNearest: boolean | ((prevState: boolean) => boolean);
        }) => {
            setIsLog(data.isLog);
            setIsNearest(data.isNearest);
        },
        []
    );

    // color map function
    const colorMapFunc = React.useCallback(() => {
        return createColorMapFunction(colorName, isLog, isNearest, breakPoints);
    }, [colorName, isLog, isNearest, breakPoints]);

    const min = 100;
    const max = 1000;

    const updatedLayerData = [
        {
            ...meshMapLayerFloat32,
            colorMapName: colorName,
            colorMapRange:
                colorRange && isAuto == false ? colorRange : [min, max],
            colorMapFunction: colorMapFunc(),
        },
    ];
    return (
        <SubsurfaceViewer {...args} layers={updatedLayerData}>
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_1">
                    <div style={{ marginTop: 50 }}>
                        <ColorLegend
                            min={min}
                            max={max}
                            colorNameFromSelector={colorNameFromSelector}
                            getColorRange={userDefinedRange}
                            getInterpolateMethod={getInterpolateMethod}
                            getBreakpointValue={userDefinedBreakPoint}
                            horizontal={true}
                            numberOfTicks={2}
                        />
                    </div>
                </View>
            }
        </SubsurfaceViewer>
    );
};

export const ColorSelector = MapLayerColorSelectorTemplate.bind({});

ColorSelector.args = {
    ...defaultArgs,
    id: "map_layer_color_selector",
    legend: {
        visible: true,
    },
    layers: [{ ...meshMapLayerFloat32 }],
    views: {
        layout: [1, 1],
        showLabel: true,
        viewports: [
            {
                id: "view_1",
                zoom: -4,
            },
        ],
    },
};

const ContourLinesStory = (props: {
    syncViewports: boolean;
    show3d: boolean;
    contourOffset: number;
    zContourInterval: number;
    propertyContourInterval: number;
    marginPixels: number;
}) => {
    const views: ViewsType = {
        layout: [2, 2],
        viewports: [
            {
                id: "view_1",
                show3D: props.show3d,
                layerIds: ["default_map"],
                isSync: props.syncViewports,
            },
            {
                id: "view_2",
                show3D: props.show3d,
                layerIds: ["contours"],
                isSync: props.syncViewports,
            },
            {
                id: "view_3",
                show3D: props.show3d,
                layerIds: ["property_contours"],
                isSync: props.syncViewports,
            },
            {
                id: "view_4",
                show3D: props.show3d,
                layerIds: ["flat"],
                isSync: props.syncViewports,
            },
        ],
    };

    const contourMapLayer = new MapLayer({
        ...defaultMapLayerProps,
        id: "contours",
        contours: [props.contourOffset, props.zContourInterval],
    });

    const propertyContourMapLayer = new MapLayer({
        ...defaultMapLayerProps,
        id: "property_contours",
        contours: [props.contourOffset, props.propertyContourInterval],
        isContoursDepth: false,
    });

    const flatMapLayerProps = {
        ...defaultMapLayerProps,
        id: "flat",
        meshData: undefined,
        contours: [props.contourOffset, props.propertyContourInterval] as [
            number,
            number,
        ],
    };

    const flatPropertyContourMapLayer = new MapLayer({
        ...flatMapLayerProps,
    });

    return (
        <SubsurfaceViewer
            id={"test"}
            layers={[
                defaultMapLayer,
                contourMapLayer,
                propertyContourMapLayer,
                flatPropertyContourMapLayer,
            ]}
            views={views}
        >
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_1">
                    <ViewFooter>Default - no contour lines</ViewFooter>
                </View>
            }
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_2">
                    <ViewFooter>
                        Contour lines enabled - default is Z value
                    </ViewFooter>
                </View>
            }
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_3">
                    <ViewFooter>Contour lines on property value</ViewFooter>
                </View>
            }
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_4">
                    <ViewFooter>
                        Contour lines on flat map - default is property value
                    </ViewFooter>
                </View>
            }
        </SubsurfaceViewer>
    );
};

export const ContourLines: ComponentStory<typeof ContourLinesStory> = (
    args
) => {
    return <ContourLinesStory {...args} />;
};

ContourLines.args = {
    syncViewports: true,
    show3d: true,
    contourOffset: 0,
    zContourInterval: 100,
    propertyContourInterval: 5000,
    marginPixels: 0,
};
