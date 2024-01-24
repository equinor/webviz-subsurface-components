import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";

import { argTypes } from "../sharedDoc";
import type { EditedDataTemplate } from "../sharedSettings";
import {
    Root,
    classes,
    colormapLayer,
    customLayerWithPolygonData,
    customLayerWithPolylineData,
    customLayerWithTextData,
    huginMeshMapLayerPng,
    subsufaceProps,
    hugin2DBounds,
    default3DViews,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Examples",
    argTypes: argTypes,
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
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
        layers: [{ ...huginMeshMapLayerPng, material }],
        bounds: hugin2DBounds,
        views: default3DViews,
    },
    parameters: {
        docs: {
            description: {
                story: "An example showing example usage of Map3D material property.",
            },
            inlineStories: false,
            iframeHeight: 500,
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
                ...huginMeshMapLayerPng,
                propertyValueRange,
                colorMapRange,
                colorMapClampColor,
            },
        ],
        bounds: [432150, 6475800, 439400, 6481500],
        views: {
            layout: [1, 1],
            viewports: [
                {
                    id: "view_1",
                    show3D: false,
                    layerIds: [],
                },
            ],
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'An example usage of map property `"colorMapClampColor"',
            },
            inlineStories: false,
            iframeHeight: 500,
        },
    },
};

// Example using "colorMapFunction" property.
const layer = {
    ...huginMeshMapLayerPng,
    isContoursDepth: true,
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
                colorMapFunction: (x) => [
                    255 - x * 100,
                    255 - x * 100,
                    255 * x,
                ], // If defined this function will override the colormap.
            },
        ],
        bounds: [432150, 6475800, 439400, 6481500],
        views: {
            layout: [1, 1],
            viewports: [
                {
                    id: "view_1",
                    show3D: true,
                    layerIds: [],
                },
            ],
        },
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
