export type TrajectorySimulationProps = {
    sampleCount?: number;
    segmentLength?: number;

    /**
     * How much the well can deviate from the path, in degrees.
     */
    dipDeviationMagnitude?: number;
};
