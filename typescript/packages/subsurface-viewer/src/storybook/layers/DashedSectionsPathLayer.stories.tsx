import React from "react";

import type { Meta, StoryObj } from "@storybook/react";
import type { Position } from "@deck.gl/core";
import { DashedSectionsPathLayer } from "../../layers/wells/layers/dashedSectionsPathLayer";
import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { TrajectorySimulationProps, WellCount } from "../types/well";
import { useSyntheticWellCollection } from "../util/wellSynthesis";
import {
    TRAJECTORY_SIMULATION_ARGTYPES,
    WELL_COUNT_ARGTYPES,
} from "../constant/argTypes";
import type { WellFeature } from "../../layers/wells/types";

const meta: Meta<typeof SubsurfaceViewerWithSyntheticWells> = {
    title: "SubsurfaceViewer / Components / DashedSectionsPathLayer",
    component: SubsurfaceViewerWithSyntheticWells,
    args: {
        wellCount: 150,
        sampleCount: 20,
        segmentLength: 150,
        dipDeviationMagnitude: 10,
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
    props: SubsurfaceViewerProps &
        TrajectorySimulationProps &
        WellCount &
        ExtraArgs
) {
    const {
        wellCount,
        sampleCount,
        segmentLength,
        dipDeviationMagnitude,
        dashArray,
    } = props;

    const wellData = useSyntheticWellCollection(wellCount, 10, {
        sampleCount,
        segmentLength,
        dipDeviationMagnitude,
    });

    const dashedSections = 6;

    return (
        <SubsurfaceViewer
            id={props.id}
            bounds={[455000, 6785000, 464000, 6790000]}
            pickingRadius={12}
            layers={[
                new DashedSectionsPathLayer<WellFeature>({
                    id: "dashed-sections-path-layer",
                    data: wellData.features,
                    positionFormat: "XY",
                    billboard: true,
                    getDashArray: dashArray,
                    getColor: [255, 0, 0],
                    getWidth: props.getWidth,
                    widthMinPixels: props.widthMinPixels,

                    pickable: true,
                    autoHighlight: true,

                    // ? Why are these unable to automatically infer types?
                    getDashedPathSection: (d) => {
                        const fullPath = d.geometry.geometries.find(
                            (f) => f.type === "LineString"
                        )?.coordinates as Position[];

                        return fullPath.filter(
                            (c, i) => i >= fullPath.length - dashedSections
                        );
                    },
                    getNormalPathSection: (d) => {
                        const fullPath = d.geometry.geometries.find(
                            (f) => f.type === "LineString"
                        )?.coordinates as Position[];

                        return fullPath.filter(
                            (c, i) => i <= fullPath.length - dashedSections
                        );
                    },
                }),
            ]}
        />
    );
}

export const Basic: Story = {
    args: {
        id: "dashed-sections-path-layer",
        getWidth: 5,
        widthMinPixels: 2,
        dashArray: [10, 5],
    },
    // @ts-expect-error -- Don't know how to get args typed so that it stops complaining
    render: SubsurfaceViewerWithSyntheticWells,
};
