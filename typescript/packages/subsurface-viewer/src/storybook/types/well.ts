export type TrajectorySimulationProps = {
    sampleCount?: number;
    segmentLength?: number;
    zIncreasingDownwards?: boolean;

    /**
     * How much the well can deviate from the path, in degrees.
     */
    dipDeviationMagnitude?: number;
};

export type WellCount = { wellCount: number };
