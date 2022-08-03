import React from "react";
import DeckGLMap from "../../DeckGLMap";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
    component: DeckGLMap,
    title: "DeckGLMap / Experimental Intersection View",
} as ComponentMeta<typeof DeckGLMap>;

const DeckGLMapTemplate: ComponentStory<typeof DeckGLMap> = (args) => {
    return <DeckGLMap {...args} />;
};

const defaultProps = {
    id: "DeckGLMap",
    views: {
        layout: [1, 2] as [number, number],
        showLabel: true,
        viewports: [
            {
                id: "orbit_view",
                name: "3d view",
                show3D: true,
            },
            {
                id: "intersection_view",
                name: "Intersection view",
                show3D: false,
                layerIds: ["enhanced-path-layer", "wells-layer"],
            },
        ],
    },
};

const polyline_data = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "LineString",
                        coordinates: [
                            [500, 2000, -400],
                            [1500, 2000, -600],
                            [1700, 2500, -400],
                        ],
                    },
                ],
            },
        },
    ],
};

// Intersection view example with sample polyline data
export const WithSamplePolylineData = DeckGLMapTemplate.bind({});
WithSamplePolylineData.args = {
    ...defaultProps,
    bounds: [0, 0, 2000, 3000] as [number, number, number, number],
    layers: [
        {
            "@@type": "UnfoldedGeoJsonLayer",
            id: "enhanced-path-layer",
            data: polyline_data,
            lineWidthScale: 20,
            lineBillboard: true,
        },
        {
            "@@type": "AxesLayer",
            id: "axes-layer",
            bounds: [0, 0, -1000, 2000, 3000, 0],
        },
    ],
};

// Intersection view example with wells data
export const WithWellsData = DeckGLMapTemplate.bind({});
WithWellsData.args = {
    ...defaultProps,
    bounds: [432205, 6475078, 437720, 6481113] as [
        number,
        number,
        number,
        number
    ],
    resources: {
        wellsData:
            "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/volve_wells.json",
    },
    layers: [
        {
            "@@type": "AxesLayer",
            id: "axes-layer",
            bounds: [432205, 6475078, -3500, 437720, 6481113, 0],
        },
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
            lineStyle: {
                width: (object: Record<string, Record<string, unknown>>) => {
                    if (object["properties"]["name"] === "15/9-F-4") return 6;
                    return 0;
                },
            },
        },
    ],
};
