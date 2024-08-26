import type { Meta, StoryObj } from "@storybook/react";

import { GeoJsonLayer } from "@deck.gl/layers";
import type { Feature } from "geojson";

import SubsurfaceViewer from "../../SubsurfaceViewer";

import { SideProjectionExtension } from "../../extensions//side-projection-extension";
import AxesLayer from "../../layers/axes/axesLayer";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Extensions / SideProjectionExtension",
};
export default stories;

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

const DEFAULT_LAYER_PROPS = {
    id: "enhanced-path-layer",
    data: IntersectionViewData,
    lineWidthScale: 1,
    lineBillboard: true,
    pointBillboard: true,
    stroked: true,
    getPointRadius: 3,
    getLineColor: (d: Feature) => d.properties?.["color"],
    getFillColor: (d: Feature) => d.properties?.["color"],
};

export const SideProjection: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        bounds: [500, 1000, 1200, 1500] as [number, number, number, number],
        layers: [
            new AxesLayer({
                id: "axes-layer",
                bounds: [300, 800, 400, 1300, 1600, 600],
            }),
            // @ts-expect-error TS2345
            new GeoJsonLayer({
                ...DEFAULT_LAYER_PROPS,
                extensions: [new SideProjectionExtension()],
                sideViewIds: ["intersection"],
            }),
        ],
        views: {
            layout: [1, 2],
            viewports: [
                {
                    id: "normal",
                    show3D: true,
                },
                {
                    id: "intersection",
                    show3D: false,
                    target: [700, -450],
                },
            ],
        },
    },
};
