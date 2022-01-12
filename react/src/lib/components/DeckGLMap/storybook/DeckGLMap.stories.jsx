import React from "react";
import DeckGLMap from "../DeckGLMap";
import exampleData from "../../../../demo/example-data/deckgl-map.json";
import colorTables from "@emerson-eps/color-tables/src/component/color-tables.json";

export default {
    component: DeckGLMap,
    title: "DeckGLMap",
};

const Template = (args) => {
    const [editedData, setEditedData] = React.useState(args.editedData);
    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);
    return (
        <DeckGLMap
            {...args}
            editedData={editedData}
            setProps={(updatedProps) => {
                setEditedData(updatedProps.editedData);
            }}
        />
    );
};

// Data for custome geojson layer with polyline data
const customLayerWithPolylineData = {
    "@@type": "GeoJsonLayer",
    id: "geojson-line-layer",
    data: {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: [
                        [434000, 6477500],
                        [435500, 6477500],
                    ],
                },
            },
        ],
    },
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
};

// Data for custom geojson layer with polygon data
const customLayerWithPolygonData = {
    "@@type": "GeoJsonLayer",
    id: "geojson-layer",
    data: {
        type: "Feature",
        properties: {},
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [434562, 6477595],
                    [434562, 6478595],
                    [435062, 6478595],
                    [435062, 6477595],
                    [434562, 6477595],
                ],
            ],
        },
    },
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getLineColor: [0, 255, 255],
    getFillColor: [0, 255, 0],
    opacity: 0.3,
};

// Data for custom text layer
const customLayerWithTextData = {
    "@@type": "TextLayer",
    id: "text-layer",
    data: [
        {
            name: "Custom GeoJson layer",
            coordinates: [434800, 6478695],
        },
    ],
    pickable: true,
    getPosition: (d) => d.coordinates,
    getText: (d) => d.name,
    getColor: [255, 0, 0],
    getSize: 16,
    getAngle: 0,
    getTextAnchor: "middle",
    getAlignmentBaseline: "center",
};

// Layers data for storybook example 1
const layersData1 = [
    customLayerWithPolylineData,
    customLayerWithPolygonData,
    customLayerWithTextData,
];

// Layers data for storybook example 2
const colormapLayer = exampleData[0].layers[0];
const layersData2 = [
    colormapLayer,
    customLayerWithPolylineData,
    customLayerWithPolygonData,
    customLayerWithTextData,
];

const hillshadingLayer = exampleData[0].layers[1];

// Storybook example 1
export const Default = Template.bind({});
Default.args = {
    ...exampleData[0],
    colorTables: colorTables,
};

// Volve kh netmap data, flat surface
export const KhMapFlat = Template.bind({});
KhMapFlat.args = {
    ...exampleData[0],
    resources: {
        propertyMap: "./volve_property_normalized.png",
        depthMap: "./volve_hugin_depth_normalized.png",
    },
    colorTables: colorTables,
    layers: [
        {
            ...colormapLayer,
            valueRange: [-3071, 41048],
            colorMapRange: [-3071, 41048],
            bounds: [432150, 6475800, 439400, 6481500],
            colormap:
                "https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster@0.3.1/assets/colormaps/gist_rainbow.png",
        },
        {
            ...hillshadingLayer,
            valueRange: [2725, 3397],
            bounds: [432150, 6475800, 439400, 6481500],
            opacity: 0.6,
        },
    ],
};

// Storybook example 2
export const UserDefinedLayer1 = Template.bind({});
UserDefinedLayer1.args = {
    id: exampleData[0].id,
    bounds: exampleData[0].bounds,
    layers: layersData1,
};

// Storybook example 3
export const UserDefinedLayer2 = Template.bind({});
UserDefinedLayer2.args = {
    id: exampleData[0].id,
    resources: exampleData[0].resources,
    bounds: exampleData[0].bounds,
    layers: layersData2,
};
