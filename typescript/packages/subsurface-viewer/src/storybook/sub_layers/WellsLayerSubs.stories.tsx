import React from "react";

import type {
    AccessorContext,
    Position as GlPosition,
    Layer,
} from "@deck.gl/core";
import { PathLayer } from "@deck.gl/layers";
import type { Meta, StoryObj } from "@storybook/react";
import type { Position } from "geojson";
import { chunk, clamp } from "lodash";

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
    const { wellCount, sampleCount, segmentLength, dipDeviationMagnitude } =
        props;

    const wellData = useSyntheticWellCollection(wellCount, 10, {
        sampleCount,
        segmentLength,
        dipDeviationMagnitude,
    });

    if (!wellData.features) return null;

    return (
        <SubsurfaceViewer
            id={props.id}
            bounds={[455000, 6785000, 464000, 6790000]}
            pickingRadius={12}
            layers={props.makeLayers(wellData)}
        />
    );
}

export const DashedSections: Story = {
    args: {
        id: "trajectory-markers-layer",
        getWidth: 5,
        widthMinPixels: 3,
        dashSegmentSize: 4,
        dashArray: [3, 3],
    },
    render: (args) => (
        // @ts-expect-error -- Don't know how to get args typed so that it stops complaining
        <SubsurfaceViewerWithSyntheticWells
            {...args}
            makeLayers={(wellData) => [
                new DashedSectionsPathLayer<WellFeature>({
                    id: "wells-sublayer-dashed-sections",
                    data: wellData.features,
                    positionFormat: "XY",
                    billboard: true,
                    getDashArray: args["dashArray"],
                    getColor: [255, 0, 0],
                    getWidth: args["getWidth"],
                    widthMinPixels: args["widthMinPixels"],

                    pickable: true,
                    autoHighlight: true,

                    getDashedPathSection: (d) =>
                        getChunkedTrajectoryPath(
                            d,
                            args["dashSegmentSize"]
                        ).filter((c, i) => i % 2 === 0),
                    getNormalPathSection: (d) =>
                        getChunkedTrajectoryPath(
                            d,
                            args["dashSegmentSize"]
                        ).filter((c, i) => i % 2 !== 0),

                    updateTriggers: {
                        getDashedPathSection: [args["dashSegmentSize"]],
                        getNormalPathSection: [args["dashSegmentSize"]],
                    },
                }),
            ]}
        />
    ),
};

// Utility to split a trajectory's path into segment-chunks. Each chunk connects to the next segment (aka chunk1[-1] === chunk2[0]).
function getChunkedTrajectoryPath(d: WellFeature, chunkSize: number) {
    const fullPath = getTrajectoryCoordinates(d);

    if (chunkSize < 1) return [fullPath];

    const chunkedPath = chunk(fullPath, chunkSize);

    return chunkedPath.map((chunk, i) => {
        const nextChunk = chunkedPath[i + 1];
        if (!nextChunk) return chunk;
        return [...chunk, nextChunk[0]];
    });
}

export const TrajectoryMarkers: Story = {
    args: {
        markerPosition: 0.9,
    },

    argTypes: {
        markerPosition: {
            control: { type: "range", min: 0, max: 1, step: 0.01 },
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
                    positionFormat: "XY",
                    billboard: true,
                    widthMinPixels: 1,
                    getWidth: 2,
                    getColor: [115, 115, 115],
                    getPath: (d) => getTrajectoryCoordinates(d) as GlPosition[],
                }),
                new TrajectoryMarkersLayer({
                    id: "well-markers",
                    data: wellData.features,
                    positionFormat: "XY",
                    getLineWidth: 1,
                    lineWidthMinPixels: 2,
                    getMarkerColor: [255, 0, 0],
                    getTrajectoryPath: getTrajectoryCoordinates,
                    getMarkers(d, i) {
                        return getTrajectoryMarkers(
                            d,
                            i,
                            args["markerPosition"]
                        );
                    },

                    updateTriggers: {
                        getMarkers: [args["markerPosition"]],
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
