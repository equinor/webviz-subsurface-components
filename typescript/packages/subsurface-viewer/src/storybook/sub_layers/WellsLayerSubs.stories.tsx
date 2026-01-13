import React from "react";

import type {
    AccessorContext,
    Position as GlPosition,
    Layer,
} from "@deck.gl/core";
import { PathLayer } from "@deck.gl/layers";
import type { Meta, StoryObj } from "@storybook/react";
import type { Position } from "geojson";
import { clamp, round } from "lodash";

import { DashedSectionsPathLayer } from "../../layers/wells/layers/dashedSectionsPathLayer";
import type { TrajectoryMarker } from "../../layers/wells/layers/trajectoryMarkerLayer";
import { TrajectoryMarkersLayer } from "../../layers/wells/layers/trajectoryMarkerLayer";
import type {
    WellFeature,
    WellFeatureCollection,
} from "../../layers/wells/types";
import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import {
    TRAJECTORY_SIMULATION_ARGTYPES,
    WELL_COUNT_ARGTYPES,
} from "../constant/argTypes";
import { default3DViews } from "../sharedSettings";
import type { TrajectorySimulationProps, WellCount } from "../types/well";
import { useSyntheticWellCollection } from "../util/wellSynthesis";

const meta: Meta<typeof SubsurfaceViewerWithSyntheticWells> = {
    title: "SubsurfaceViewer / Sub Layers / Wells Layer",
    component: SubsurfaceViewerWithSyntheticWells,
    args: {
        wellCount: 150,
        sampleCount: 20,
        segmentLength: 170,
        dipDeviationMagnitude: 10,
        getWidth: 5,
        widthMinPixels: 3,
        use3dView: false,
    },
    argTypes: {
        ...WELL_COUNT_ARGTYPES,
        ...TRAJECTORY_SIMULATION_ARGTYPES,
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

function SubsurfaceViewerWithSyntheticWells<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ExtraArgs extends Record<string, any> = object,
>(
    props: {
        makeLayers: (data: WellFeatureCollection) => Layer[];
    } & SubsurfaceViewerProps &
        TrajectorySimulationProps &
        WellCount &
        ExtraArgs
) {
    const {
        wellCount,
        sampleCount,
        segmentLength,
        dipDeviationMagnitude,
        use3dView,
    } = props;

    const wellData = useSyntheticWellCollection(wellCount, 10, {
        sampleCount,
        segmentLength,
        dipDeviationMagnitude,
        zIncreasingDownwards: true,
    });

    const views = React.useMemo(() => {
        if (use3dView) return default3DViews;
        return undefined;
    }, [use3dView]);

    if (!wellData.features) return null;

    return (
        <SubsurfaceViewer
            id={props.id}
            bounds={[455000, 6785000, 464000, 6790000]}
            pickingRadius={24}
            views={views}
            layers={props.makeLayers(wellData)}
        />
    );
}

export const DashedSections: Story = {
    args: {
        id: "trajectory-markers-layer",
        getWidth: 5,
        widthMinPixels: 3,
        dashSegmentSize: 0.3,
        dashArray: [3, 3],
    },
    argTypes: {
        dashSegmentSize: {
            control: {
                type: "range",
                min: 0,
                max: 1,
                step: 0.01,
            },
        },
    },
    render: (args) => (
        // @ts-expect-error -- Don't know how to get args typed so that it stops complaining
        <SubsurfaceViewerWithSyntheticWells
            {...args}
            makeLayers={(wellData) => [
                new DashedSectionsPathLayer<WellFeature>({
                    // @ts-expect-error -- Forcing name so readout works in story
                    name: "Dashed Paths",
                    id: "wells-sublayer-dashed-sections",
                    data: wellData.features,
                    positionFormat: args.use3dView ? "XYZ" : "XY",
                    billboard: true,
                    getDashArray: args["dashArray"],
                    getColor: [255, 0, 0],
                    getWidth: args["getWidth"],
                    widthMinPixels: args["widthMinPixels"],
                    opacity: 0.1,
                    pickable: true,
                    autoHighlight: true,

                    getPath: getTrajectoryCoordinates,
                    getPathFractions: (d) =>
                        d.properties.md[0].map((md) => {
                            return round(md / d.properties.md[0].at(-1)!, 2);
                        }),

                    getDashedSectionsAlongPath: (d) =>
                        getDashedSectionsAlongPath(d, args["dashSegmentSize"]),

                    updateTriggers: {
                        getDashedSectionsAlongPath: [
                            args["dashSegmentSize"],
                            args["use3dView"],
                        ],
                    },
                }),
            ]}
        />
    ),
};

function getDashedSectionsAlongPath(d: WellFeature, dashSegmentSize: number) {
    if (!dashSegmentSize) return [];

    // Computing in hundreds to avoid floating point errors
    const segSize = dashSegmentSize * 50;
    const anchor = 80; // Placing it more towards the end so it's more visible in 2D

    return [(anchor - segSize) / 100, (anchor + segSize) / 100];
}

export const TrajectoryMarkers: Story = {
    args: {
        markerPosition: 0.9,
    },

    argTypes: {
        markerPosition: {
            control: { type: "range", min: 0.3, max: 1, step: 0.01 },
        },
    },
    render: (args) => (
        // @ts-expect-error -- Don't know how to get args typed so that it stops complaining
        <SubsurfaceViewerWithSyntheticWells
            {...args}
            id="wells-sublayer-markers"
            makeLayers={(wellData) => [
                new PathLayer({
                    id: "well-paths",
                    data: wellData.features,
                    positionFormat: args.use3dView ? "XYZ" : "XY",
                    billboard: true,
                    widthMinPixels: 1,
                    lineWidthUnits: "pixels",
                    getWidth: 2,
                    getColor: [115, 115, 115],
                    getPath: (d) => getTrajectoryCoordinates(d) as GlPosition[],
                    updateTriggers: { getPath: [args.use3dView] },
                }),
                new TrajectoryMarkersLayer({
                    // @ts-expect-error -- Forcing name so readout works in story
                    name: "Trajectory Marker Layer",
                    id: "well-markers",
                    data: wellData.features,
                    positionFormat: args.use3dView ? "XYZ" : "XY",
                    getLineWidth: 2,
                    lineWidthMinPixels: 1,
                    getMarkerColor: (d) => {
                        if (d.properties?.status === "closed")
                            return [255, 0, 0];
                        if (d.properties?.status === "open")
                            return [0, 155, 115];

                        return [115, 115, 115];
                    },

                    lineWidthScale: 1,
                    lineWidthUnits: "pixels",
                    lineBillboard: true,

                    pickable: true,
                    autoHighlight: true,
                    getTrajectoryPath: getTrajectoryCoordinates,
                    getMarkers(d, i) {
                        return getTrajectoryMarkers(d, i, args.markerPosition);
                    },

                    updateTriggers: {
                        getMarkers: [args.markerPosition],
                        getTrajectoryPath: [args.use3dView],
                    },
                }),
            ]}
        />
    ),
};

function getTrajectoryCoordinates(d: WellFeature): Position[] {
    return (d.geometry.geometries.find((f) => f.type === "LineString")
        ?.coordinates ?? []) as Position[];
}

function getTrajectoryMarkers(
    d: WellFeature,
    itemInfo: AccessorContext<WellFeature>,
    markerPosition: number
): TrajectoryMarker[] {
    if (itemInfo.index % 4 === 0)
        return [
            {
                type: "perforation",
                positionAlongPath: markerPosition,
                properties: {
                    status: "open",
                    name: `Perforation ${d.properties.name} XX-yy `,
                },
            },

            {
                type: "perforation",
                positionAlongPath: 1.3 - markerPosition,
                properties: {
                    status: "closed",
                    name: `Perforation ${d.properties.name} AA-bb `,
                },
            },
        ];

    if (itemInfo.index % 5 === 0) {
        return [
            {
                type: "screen-start",
                positionAlongPath: clamp(markerPosition - 0.05, 0, 1),
            },
            {
                type: "screen-end",
                positionAlongPath: clamp(markerPosition + 0.05, 0, 1),
            },
        ];
    }

    return [];
}
