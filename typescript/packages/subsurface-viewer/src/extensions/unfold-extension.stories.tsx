import SubsurfaceViewer from "../SubsurfaceViewer";
import type { StoryFn } from "@storybook/react";
import React from "react";
import type { Feature } from "geojson";
import AxesLayer from "../layers/axes/axesLayer";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import ClipExtension from "./clip-extension";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Unfold Extension",
};

const StoryTemplate: StoryFn<typeof SubsurfaceViewer> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

const defaultProps = {
    id: "SubsurfaceViewer",
    views: {
        layout: [1, 1] as [number, number],
        showLabel: true,
        viewports: [
            {
                id: "orbit_view",
                name: "3d view",
                show3D: true,
                isSync: false,
            },
        ],
    },
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

const CLIP = new ClipExtension();

export const Clipping = StoryTemplate.bind({});
Clipping.args = {
    ...defaultProps,
    bounds: [500, 1000, 1200, 1500] as [number, number, number, number],
    layers: [
        new AxesLayer({
            id: "axes-layer",
            bounds: [300, 800, 400, 1300, 1600, 600],
        }),
        new GeoJsonLayer({
            id: "enhanced-path-layer",
            data: IntersectionViewData,
            lineWidthScale: 1,
            lineBillboard: true,
            pointBillboard: true,
            stroked: true,
            getPointRadius: 3,
            getLineColor: (d: Feature) => d.properties?.["color"],
            getFillColor: (d: Feature) => d.properties?.["color"],
            extensions: [CLIP],
            clipBounds: [900, 900, 1300, 1300],
            clipByInstance: true,
        }),
    ],
};
