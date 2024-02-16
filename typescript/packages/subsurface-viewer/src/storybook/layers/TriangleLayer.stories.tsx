import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { create, all } from "mathjs";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import * as SurfacePoints from "../../layers/triangle/test_data/surfacePoints";
import * as SurfaceTriangles from "../../layers/triangle/test_data/surfaceTriangles";

import {
    default3DViews,
    defaultStoryParameters,
    northArrowLayer,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Triangle Layer",
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
        triggerHome: 0,
    },
};
export default stories;

// Small example using triangleLayer.
const triangleLayer = {
    "@@type": "TriangleLayer",
    id: "triangle-layer",

    /*eslint-disable */
    pointsData: [
        0,
        0,
        5, // Vertex 1, x, y, z
        10,
        0,
        5, // Vertex 2, x, y, z
        10,
        10,
        5, // ...
        0,
        10,
        0,
        5,
        -5,
        10,
        11,
        -4,
        6,
        11,
        0,
        7,
        17,
        0,
        8,
    ],

    triangleData: [
        2,
        1,
        0, // Indexs' to first triangle.
        3,
        2,
        0, // ...
        1,
        4,
        0,
        6,
        7,
        5,
    ],

    color: [100, 100, 255], // Surface color.
    gridLines: true, // If true will draw lines around triangles.
    material: true, // If true will use triangle normals for shading.
    smoothShading: true, // If true will use vertex calculated mean normals for shading.
    ZIncreasingDownwards: true,
    //contours: [0, 1],          // If used will display contour lines.
    /*eslint-enable */
};

const axesLayer = {
    "@@type": "AxesLayer",
    id: "axes_small",
    bounds: [-10, -10, 0, 20, 10, 10],
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

const flipOrientation = (triangles: number[]) => {
    const res: number[] = [];
    for (let i = 0; i < triangles.length; i += 3) {
        res.push(triangles[i]);
        res.push(triangles[i + 2]);
        res.push(triangles[i + 1]);
    }
    return res;
};

const shiftPointsByZ = (points: number[], shift: number) => {
    const res: number[] = [];
    for (let i = 0; i < points.length; i += 3) {
        res.push(points[i]);
        res.push(points[i + 1]);
        res.push(points[i + 2] + shift);
    }
    return res;
};

const upperSurfaceLayer = {
    "@@type": "TriangleLayer",
    id: "upper_surface_layer",

    /*eslint-disable */
    pointsData: SurfacePoints.default,
    triangleData: SurfaceTriangles.default,

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
    /*eslint-enable */
};

const lowerSurfaceLayer = {
    "@@type": "TriangleLayer",
    id: "lowers_surface_layer",

    /*eslint-disable */
    pointsData: shiftPointsByZ(SurfacePoints.default, 1000),
    triangleData: flipOrientation(SurfaceTriangles.default),

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

export const TwoSideLighting: StoryObj<typeof SubsurfaceViewer> = {
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
    id: "typedData_surface_layer",

    /*eslint-disable */
    pointsData: new Float32Array(SurfacePoints.default),
    triangleData: new Uint32Array(SurfaceTriangles.default),

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

export const TypedArrayInput: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [surfaceAxesLayer, typedDataSurfaceLayer],
        bounds: [-2000, -2000, 2500, 2000],
        views: default3DViews,
        typedArraySupport: true,
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
    const triangles = Array(trglDataSize * count).fill(0);
    for (let i = 0; i < count; ++i) {
        // random triangle center
        const center = Array(3)
            .fill(0)
            .map(() => randomFunc(bboxSize));
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

                triangleData: Array(3 * props.triangleCount)
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
