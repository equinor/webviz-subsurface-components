import type { Layer } from "@deck.gl/core";
import { all, create } from "mathjs";
import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer, { TGrid3DColoringMode } from "../../SubsurfaceViewer";
import Grid3DLayer from "../../layers/grid3d/grid3dLayer";

import { argTypes } from "../sharedDoc";
import type { EditedDataTemplate } from "../sharedSettings";
import {
    Root,
    classes,
    colormapLayer,
    customLayerWithPolygonData,
    customLayerWithPolylineData,
    customLayerWithTextData,
    default2DViews,
    default3DViews,
    defaultStoryParameters,
    hugin25mKhNetmapMapLayerPng,
    hugin2DBounds,
    subsufaceProps,
} from "../sharedSettings";

import {
    Faces as SnubCubeFaces,
    Points as SnubCubePoints,
    VertexCount as SnubCubeVertexCount,
} from "../../layers/grid3d/test_data/TruncatedSnubCube";

import {
    Faces as ToroidFaces,
    Points as ToroidPoints,
    VertexCount as ToroidVertexCount,
} from "../../layers/grid3d/test_data/PentagonalToroid";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Examples",
    argTypes: argTypes,
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

// Layers data for storybook example 1
const layersData1 = [
    customLayerWithPolylineData,
    customLayerWithPolygonData,
    customLayerWithTextData,
];

// Layers data for storybook example 2
const layersData2 = [
    colormapLayer,
    customLayerWithPolylineData,
    customLayerWithPolygonData,
    customLayerWithTextData,
];

// Storybook example 1
export const Default: StoryObj<typeof EditedDataTemplate> = {
    args: subsufaceProps,
};

// Minimal map example.
export const Minimal: StoryObj = {
    parameters: {
        docs: {
            description: {
                story: "An example showing the minimal required arguments, which will give an empty map viewer.",
            },
        },
    },
    render: () => <SubsurfaceViewer id={"deckgl-map"} bounds={[0, 0, 1, 1]} />,
};

//Material property may take these values:
//          true  = default material. See deck.gl documentation for what that is. This is default property value.
//          false = no material.
//          Full spec:
//                {
//                    ambient: 0.35,
//                    diffuse: 0.6,
//                    shininess: 32,
//                    specularColor: [255, 255, 255],
//                }
const material = {
    ambient: 0.35,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [255, 255, 255],
};

export const MapMaterial: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "material",
        layers: [{ ...hugin25mKhNetmapMapLayerPng, material }],
        bounds: hugin2DBounds,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "An example showing example usage of Map3D material property.",
            },
        },
    },
};

// Exapmple of using "colorMapClampColor" property.
// Clamps colormap to this color at ends.
// Given as array of three values (r,g,b) e.g: [255, 0, 0]
// If not set (undefined) or set to true, it will clamp to color map min and max values.
// If set to false the clamp color will be completely transparent.
const propertyValueRange = [2782, 3513];
const colorMapRange = [3000, 3513];
const colorMapClampColor = [0, 255, 0]; // a color e.g. [0, 255, 0],  false, true or undefined.

export const MapClampColor: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "clampcolor",
        layers: [
            {
                ...hugin25mKhNetmapMapLayerPng,
                propertyValueRange,
                colorMapRange,
                colorMapClampColor,
            },
        ],
        bounds: hugin2DBounds,
        views: default2DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: 'An example usage of map property `"colorMapClampColor"',
            },
        },
    },
};

// Example using "colorMapFunction" property.
const layer = {
    ...hugin25mKhNetmapMapLayerPng,
    isContoursDepth: true,
    // @ts-expect-error TS7006
    colorMapFunction: (x) => [255 - x * 100, 255 - x * 100, 255 * x], // If defined this function will override the colormap.
};
export const colorMapFunction: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "colorMapFunction",
        layers: [
            // map layer
            layer,
            // colormap layer
            {
                ...colormapLayer,
                image: "propertyMap.png",
                // @ts-expect-error TS7006
                colorMapFunction: (x) => [
                    255 - x * 100,
                    255 - x * 100,
                    255 * x,
                ], // If defined this function will override the colormap.
            },
        ],
        bounds: hugin2DBounds,
        views: default3DViews,
    },
};

// custom layer example
export const UserDefinedLayer1: StoryObj<typeof EditedDataTemplate> = {
    args: {
        id: subsufaceProps.id,
        bounds: subsufaceProps.bounds,
        layers: layersData1,
    },
};

// custom layer with colormap
export const UserDefinedLayer2: StoryObj<typeof EditedDataTemplate> = {
    args: {
        id: subsufaceProps.id,
        resources: subsufaceProps.resources,
        bounds: subsufaceProps.bounds,
        layers: layersData2,
    },
};

// ---------Selectable GeoJson Layer example--------------- //
const SelectableFeatureComponent: React.FC<SubsurfaceViewerProps> = (args) => {
    const [editedData, setEditedData] = React.useState(args.editedData);
    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);
    return (
        <div>
            <SubsurfaceViewer
                {...args}
                editedData={editedData}
                setProps={(updatedProps) => {
                    setEditedData(
                        // @ts-expect-error TS4111
                        updatedProps.editedData as Record<string, unknown>
                    );
                }}
            />
            <pre>{JSON.stringify(editedData, null, 2)}</pre>
        </div>
    );
};

const polylineUsingSelectableGeoJsonLayer = {
    ...customLayerWithPolylineData,
    "@@type": "SelectableGeoJsonLayer",
};

const polygonUsingSelectableGeoJsonLayer = {
    ...customLayerWithPolygonData,
    "@@type": "SelectableGeoJsonLayer",
};

export const SelectableFeatureExample: StoryObj<
    typeof SelectableFeatureComponent
> = {
    args: {
        id: "DeckGL-Map",
        bounds: [432205, 6475078, 437720, 6481113],
        layers: [
            polylineUsingSelectableGeoJsonLayer,
            polygonUsingSelectableGeoJsonLayer,
        ],
    },
    parameters: {
        docs: {
            description: {
                story: "An example showing selectable feature example from the map.",
            },
        },
    },
    render: (args) => <SelectableFeatureComponent {...args} />,
};

export const MapInContainer: StoryObj<typeof SubsurfaceViewer> = {
    args: subsufaceProps,
    render: (args) => (
        <Root className={classes.main}>
            <SubsurfaceViewer {...args} />
        </Root>
    ),
};

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
        ...defaultStoryParameters,
        description: {
            story: "Demonstrates mixed ways of layer creation.",
        },
    },
};

export const MixedLayerDefinitions: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        bounds: [-25, -25, 50, 30],
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
            undefined,
            {
                ...axes,
                id: "polyhedral-cells-axes-typed-input",
                bounds: [-15, -15, -15, 40, 20, 15],
            },
            null,
            {
                ...grid3dLayer,
                id: "polyhedral1-typed-input",
                "@@typedArraySupport": true,
                coloringMode: TGrid3DColoringMode.Y,
                pickable: true,
                pointsData: new Float32Array(snubCubePoints),
                polysData: new Uint32Array(SnubCubeFaces),
                propertiesData: new Float32Array(snubCubeProperties),
                colorMapRange: [-8, 8],
                colorMapClampColor: [200, 200, 200],
                colorMapName: "Seismic",
            },
            false,
            new Grid3DLayer({
                gridLines: true,
                material: true,
                colorMapName: "Rainbow",
                ZIncreasingDownwards: false,
                id: "polyhedral2-typed-input",
                pickable: true,
                pointsData: new Float32Array(toroidPoints),
                polysData: new Uint32Array(ToroidFaces),
                propertiesData: new Float32Array(toroidProperties),
                coloringMode: TGrid3DColoringMode.Property,
            }) as unknown as Layer,
        ],
    },
    parameters: parameters,
};
