import type { ArgTypes } from "@storybook/react";
import type { WellLabelLayerProps } from "../../layers/wells/layers/wellLabelLayer";
import type { TrajectorySimulationProps } from "../types/trajectory";

export const LABEL_POSITION_ARGTYPES: Partial<ArgTypes<WellLabelLayerProps>> = {
    getPositionAlongPath: {
        control: {
            type: "range",
            min: 0,
            max: 1,
            step: 0.01,
        },
    },
};

export const LABEL_SIZE_ARGTYPES: Partial<ArgTypes<WellLabelLayerProps>> = {
    getSize: {
        control: {
            type: "range",
            min: 0,
            max: 50,
            step: 1,
        },
    },
};

export const LABEL_ORIENTATION_ARGTYPES: Partial<
    ArgTypes<WellLabelLayerProps>
> = {
    orientation: {
        options: ["horizontal", "tangent"],
        control: {
            type: "select",
        },
    },
};

export const TRAJECTORY_SIMULATION_ARGTYPES: Partial<
    ArgTypes<TrajectorySimulationProps>
> = {
    sampleCount: {
        control: {
            type: "range",
            min: 1,
            max: 100,
            step: 1,
        },
    },
    segmentLength: {
        control: {
            type: "range",
            min: 1,
            max: 1000,
            step: 1,
        },
    },
    dipDeviationMagnitude: {
        control: {
            type: "range",
            min: 0,
            max: 90,
            step: 1,
        },
    },
};
