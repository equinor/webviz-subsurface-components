import React from "react";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Feature } from "geojson";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Experimental Intersection View",
} as ComponentMeta<typeof SubsurfaceViewer>;

const StoryTemplate: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

const defaultProps = {
    id: "SubsurfaceViewer",
    views: {
        layout: [1, 2] as [number, number],
        showLabel: true,
        viewports: [
            {
                id: "orbit_view",
                name: "3d view",
                show3D: true,
                isSync: false,
            },
            {
                id: "intersection_view",
                name: "Intersection view",
                show3D: false,
                layerIds: ["enhanced-path-layer", "wells-layer"],
                isSync: false,
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
export const WithSamplePolylineData = StoryTemplate.bind({});
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
export const WithWellsData = StoryTemplate.bind({});
WithWellsData.args = {
    ...defaultProps,
    bounds: [432205, 6475078, 437720, 6481113] as [
        number,
        number,
        number,
        number
    ],
    resources: {
        wellsData: "./volve_wells.json",
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
            wellHeadStyle: {
                size: (object: Record<string, Record<string, unknown>>) => {
                    if (object["properties"]["name"] === "15/9-F-4") return 8;
                    return 0;
                },
            },
        },
    ],
};

const FencePolygonData = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Polygon",
                        coordinates: [
                            [
                                [500, 1000, -400],
                                [800, 1200, -400],
                                [1000, 1100, -400],
                                [1000, 1100, -600],
                                [800, 1200, -600],
                                [500, 1000, -600],
                                [500, 1000, -400],
                            ],
                        ],
                    },
                ],
            },
        },
    ],
};

// With fence polygon data
export const FencePolygon = StoryTemplate.bind({});
FencePolygon.args = {
    ...defaultProps,
    bounds: [500, 1000, 1200, 1500] as [number, number, number, number],
    layers: [
        {
            "@@type": "AxesLayer",
            id: "axes-layer",
            bounds: [300, 800, -600, 1300, 1600, -400],
        },
        {
            "@@type": "UnfoldedGeoJsonLayer",
            id: "enhanced-path-layer",
            data: FencePolygonData,
            lineWidthScale: 2,
            lineBillboard: true,
            stroked: true,
        },
    ],
};

const IntersectionViewData = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Polygon",
                        coordinates: [
                            [
                                [500, 1000, -400],
                                [800, 1200, -400],
                                [1000, 1100, -400],
                                [1000, 1100, -600],
                                [800, 1200, -600],
                                [500, 1000, -600],
                                [500, 1000, -400],
                            ],
                        ],
                    },
                ],
            },
            properties: {
                name: "Fence",
                color: [235, 107, 52, 255],
            },
        },
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [500, 1000, -400],
                    },
                    {
                        type: "LineString",
                        coordinates: [
                            [500, 1000, -400],
                            [575, 1050, -450],
                            [650, 1100, -450],
                            [725, 1150, -500],
                            [800, 1200, -500],
                            [900, 1150, -550],
                            [950, 1125, -550],
                            [1000, 1100, -550],
                        ],
                    },
                ],
            },
            properties: {
                name: "Well",
                color: [52, 125, 235, 255],
            },
        },
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "LineString",
                        coordinates: [
                            [500, 1000, -475],
                            [800, 1200, -475],
                            [1000, 1100, -475],
                        ],
                    },
                ],
            },
            properties: {
                name: "Surface 1",
                color: [52, 235, 211, 255],
            },
        },
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "LineString",
                        coordinates: [
                            [500, 1000, -525],
                            [800, 1200, -525],
                            [1000, 1100, -525],
                        ],
                    },
                ],
            },
            properties: {
                name: "Surface 2",
                color: [32, 252, 3, 255],
            },
        },
    ],
};

// An intersection view example with sample surface, wells data laong with fence.
export const IntersectionViewExample = StoryTemplate.bind({});
IntersectionViewExample.args = {
    ...defaultProps,
    bounds: [500, 1000, 1200, 1500] as [number, number, number, number],
    layers: [
        {
            "@@type": "AxesLayer",
            id: "axes-layer",
            bounds: [300, 800, -600, 1300, 1600, -400],
        },
        {
            "@@type": "UnfoldedGeoJsonLayer",
            id: "enhanced-path-layer",
            data: IntersectionViewData,
            lineWidthScale: 1,
            lineBillboard: true,
            pointBillboard: true,
            stroked: true,
            getPointRadius: 3,
            getLineColor: (d: Feature) => d.properties?.["color"],
            getFillColor: (d: Feature) => d.properties?.["color"],
        },
    ],
};
