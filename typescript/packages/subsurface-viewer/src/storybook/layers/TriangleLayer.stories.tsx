import React from "react";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

import { create, all } from "mathjs";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import * as surfacePoints from "../../layers/triangle/test_data/surfacePoints";
import * as surfaceTriangles from "../../layers/triangle/test_data/surfaceTriangles";

import {
    default3DViews,
    defaultStoryParameters,
    northArrowLayer,
} from "../sharedSettings";

import { getPropsInjectorComponent } from "../sharedHelperComponents";

const SubsurfaceViewerPropsInjector = getPropsInjectorComponent(
    getInjectedProps,
    SubsurfaceViewer
);

const stories: Meta = {
    component: SubsurfaceViewerPropsInjector,
    title: "SubsurfaceViewer / Triangle Layer",
    tags: ["no-dom-test"],
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

// ---------Layers and data--------------- //
// Small example using triangleLayer.
const triangleLayer = {
    "@@type": "TriangleLayer",
    id: "triangle-layer",
    /* prettier-ignore */
    pointsData: [
        0,   0,  5,     // Vertex 1, x, y, z
        10,  0,  5,     // Vertex 2, x, y, z
        10, 10,  5,     // ...
        0,  10,  0,
        5,  -5, 10,
        11, -4,  6,
        11,  0,  7,
        17,  0,  8,
    ],
    /* prettier-ignore */
    triangleData: [
        2,  1,  0,      // Indexes to first triangle.
        3,  2,  0,      // ...
        1,  4,  0,
        6,  7,  5,
    ],
    color: [100, 100, 255], // Surface color.
    gridLines: true, // If true will draw lines around triangles.
    material: true, // If true will use triangle normals for shading.
    smoothShading: true, // If true will use vertex calculated mean normals for shading.
    ZIncreasingDownwards: true,
    //contours: [0, 1],          // If used will display contour lines.
};

const axesLayer = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [-10, -10, 0, 20, 10, 10],
};

const flipOrientation = (triangles: number[]) => {
    const res: number[] = [];
    for (let i = 0; i < triangles.length; i += 3) {
        res.push(triangles[i], triangles[i + 2], triangles[i + 1]);
    }
    return res;
};

const shiftPointsByZ = (points: number[], shift: number) => {
    const res: number[] = [];
    for (let i = 0; i < points.length; i += 3) {
        res.push(points[i], points[i + 1], points[i + 2] + shift);
    }
    return res;
};

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const typedDataSurfaceLayerId = "typedData_surface_layer";
const upperSurfaceLayerId = "upper_surface_layer";
const lowerSurfaceLayerId = "lower_surface_layer";

const injectedProps = {
    [typedDataSurfaceLayerId]: {
        pointsData: new Float32Array(surfacePoints.default),
        triangleData: new Uint32Array(surfaceTriangles.default),
    },
    [upperSurfaceLayerId]: {
        pointsData: surfacePoints.default,
        triangleData: surfaceTriangles.default,
    },
    [lowerSurfaceLayerId]: {
        pointsData: shiftPointsByZ(surfacePoints.default, 1000),
        triangleData: flipOrientation(surfaceTriangles.default),
    },
};

function getInjectedProps() {
    return injectedProps;
}

const upperSurfaceLayer = {
    "@@type": "TriangleLayer",
    id: upperSurfaceLayerId,
    "@@typedArraySupport": true,

    pointsData: "pointsData proxy",
    triangleData: "triangleData proxy",

    color: [100, 100, 255], // Surface color.
    gridLines: true, // If true will draw lines around triangles.
    material: {
        ambient: 0.35,
        diffuse: 0.6,
        shininess: 100,
        specularColor: [255, 255, 255],
    }, // If true will use triangle normals for shading.
    smoothShading: true, // If true will use vertex calculated mean normals for shading.
    ZIncreasingDownwards: true,
    debug: true,
};

const lowerSurfaceLayer = {
    "@@type": "TriangleLayer",
    id: lowerSurfaceLayerId,
    "@@typedArraySupport": true,

    pointsData: "pointsData proxy",
    triangleData: "triangleData proxy",

    color: [100, 255, 100], // Surface color.
    gridLines: true, // If true will draw lines around triangles.
    material: {
        ambient: 0.35,
        diffuse: 0.6,
        shininess: 100,
        specularColor: [255, 255, 255],
    }, // If true will use triangle normals for shading.
    smoothShading: true, // If true will use vertex calculated mean normals for shading.
    ZIncreasingDownwards: true,
    debug: true,
    /*eslint-enable */
};

const surfaceAxesLayer = {
    "@@type": "AxesLayer",
    id: "mandaros_axes_small",
    bounds: [-2000, -2000, 1500, 2500, 2000, 3000],
};

export const SmallTriangleLayer: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [axesLayer, triangleLayer, northArrowLayer],
        bounds: [-10, -10, 17, 10],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Both mesh and property data given as native javascript arrays (as opposed to URL).",
            },
        },
    },
};

export const TwoSideLighting: StoryObj<typeof SubsurfaceViewerPropsInjector> = {
    args: {
        id: "map",
        layers: [surfaceAxesLayer, upperSurfaceLayer, lowerSurfaceLayer],
        bounds: [-2000, -2000, 2500, 2000],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Both mesh and property data given as native javascript arrays (as opposed to URL).",
            },
        },
    },
};

const typedDataSurfaceLayer = {
    "@@type": "TriangleLayer",
    id: typedDataSurfaceLayerId,
    "@@typedArraySupport": true,

    pointsData: "pointsData proxy",
    triangleData: "triangleData proxy",

    color: [100, 100, 255], // Surface color.
    gridLines: true, // If true will draw lines around triangles.
    material: {
        ambient: 0.35,
        diffuse: 0.6,
        shininess: 100,
        specularColor: [255, 255, 255],
    }, // If true will use triangle normals for shading.
    smoothShading: true, // If true will use vertex calculated mean normals for shading.
    ZIncreasingDownwards: true,
    /*eslint-enable */
};

export const TypedArrayInput: StoryObj<typeof SubsurfaceViewerPropsInjector> = {
    args: {
        id: "map",
        layers: [surfaceAxesLayer, typedDataSurfaceLayer],
        bounds: [-2000, -2000, 2500, 2000],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Surface data is provided as typed arrays.",
            },
        },
    },
};

const math = create(all, { randomSeed: "12345" });

const bboxSize = 1000;
const trglSize = 100;

const randomFunc = (size: number): number => {
    if (math.random) {
        return math.random() * size;
    }
    return Math.random() * size;
};

const buildTrgl = (count: number = 1): number[] => {
    count = count || 1;
    // 9 is 3 points for the triangle * 3 vertices
    const trglDataSize = 9;
    const triangles = new Array(trglDataSize * count).fill(0);
    for (let i = 0; i < count; ++i) {
        // random triangle center
        const center = new Array(3).fill(0).map(() => randomFunc(bboxSize));
        for (let ti = 0; ti < trglDataSize; ++ti) {
            triangles[i * trglDataSize + ti] =
                center[ti % 3] + randomFunc(trglSize);
        }
    }
    return triangles;
};

const TriangleLayersGenerator: React.FC<{
    triggerHome: number;
    layerCount: number;
    triangleCount: number;
}> = (props) => {
    const tsurfLayers = React.useMemo(() => {
        const result: Record<string, unknown>[] = [];
        for (let i = 0; i <= props.layerCount; ++i) {
            result.push({
                "@@type": "TriangleLayer",
                id: `triangle-layer-${i}`,

                pointsData: buildTrgl(props.triangleCount),

                triangleData: new Array(3 * props.triangleCount)
                    .fill(0)
                    .map((_, i) => i),

                //color: [randomFunc(255), randomFunc(255), randomFunc(255)], // Surface color.
                gridLines: true, // If true will draw lines around triangles.
                material: true, // If true will use triangle normals for shading.
                ZIncreasingDownwards: true,
                //contours: [0, 1],          // If used will display contour lines.
            });
        }
        return result;
    }, [props.layerCount, props.triangleCount]);

    return (
        <SubsurfaceViewer
            triggerHome={props.triggerHome}
            id="many-triangle-layers"
            layers={tsurfLayers}
            views={default3DViews}
        />
    );
};

export const TriangleLayers: StoryObj<typeof TriangleLayersGenerator> = {
    args: {
        layerCount: 10,
        triangleCount: 1000,
    },
    render: (args) => <TriangleLayersGenerator {...args} />,
};
