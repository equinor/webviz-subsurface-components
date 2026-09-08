import React from "react";

import type { Color } from "@deck.gl/core";
import { all, create } from "mathjs";

import type {
    WellFeature,
    WellFeatureCollection,
} from "../../layers/wells/types";
import type { Point3D } from "../../utils";
import type { TrajectorySimulationProps } from "../types/well";

const RANDOM_SEED = "1984";

/**
 * Create a freshly seeded pseudo-random generator.
 *
 * Each generator is independent and always starts from the same seed, so the data
 * produced by the functions below depends only on their arguments. A single shared
 * generator would instead make output depend on how many numbers earlier callers had
 * already drawn, which is not reproducible: Storybook renders every story into one
 * page, so the draw count varies with story order, sharding and re-renders.
 */
const createRandom = (): (() => number) => {
    const math = create(all, { randomSeed: RANDOM_SEED });
    return math?.random ? math.random : Math.random;
};

/**
 * Generate a random deviation
 * @param magnitude maximum deviation in degrees
 * @returns deviation in radians
 */
const getRandomDeviation = (random: () => number, magnitude = 10, mean = 5) => {
    return (random() * (mean * 2 - magnitude * 0.5) * Math.PI) / 180;
};

const getRandomColor = (random: () => number): Color => {
    const r = 100 + Math.floor(random() * 155);
    const g = 100 + Math.floor(random() * 155);
    const b = 100 + Math.floor(random() * 155);
    return [r, g, b, 255];
};

const createSyntheticWell = (
    random: () => number,
    index: number,
    headPosition: Point3D,
    sampleCount = 20,
    segmentLength = 150,
    dipDeviationMagnitude = 10,
    zIncreasingDownwards = false
): WellFeature => {
    // Create a random well name
    const name = `Well ${index}`;

    const avgDipDeviation = random() * dipDeviationMagnitude;
    const avgAzimuthDeviation = random() * 5 - 2.5;
    const maxDip = Math.PI * 0.5 + 0.05;

    // Create a random well geometry
    const coordinates = [headPosition];
    const mdArray = [0];

    // Lead with at least three vertical segments
    const leadCount = Math.trunc(random() * (sampleCount - 2)) + 2;
    for (let i = 0; i < leadCount; i++) {
        const x = coordinates[coordinates.length - 1][0];
        const y = coordinates[coordinates.length - 1][1];
        const z = coordinates[coordinates.length - 1][2] + segmentLength;
        coordinates.push([x, y, z]);
        mdArray.push(mdArray.length * segmentLength);
    }

    let previousAzimuth = random() * Math.PI * 2;
    let previousDip = 0;

    for (let i = 0; i < sampleCount - leadCount; i++) {
        const prevSample = coordinates[coordinates.length - 1];
        const azimuth =
            previousAzimuth +
            getRandomDeviation(random, 5, avgAzimuthDeviation);
        const dip = Math.min(
            previousDip +
                getRandomDeviation(
                    random,
                    dipDeviationMagnitude,
                    avgDipDeviation
                ),
            maxDip
        );
        const x =
            prevSample[0] + segmentLength * Math.cos(azimuth) * Math.sin(dip);
        const y =
            prevSample[1] + segmentLength * Math.sin(azimuth) * Math.sin(dip);
        const z = prevSample[2] + segmentLength * Math.cos(dip);

        coordinates.push([x, y, z]);
        mdArray.push(mdArray.length * segmentLength);
        previousAzimuth = azimuth;
        previousDip = dip;
    }

    if (zIncreasingDownwards) {
        coordinates.forEach((c) => (c[2] *= -1));
    }

    return {
        type: "Feature",
        properties: {
            name,
            md: [mdArray],
            color: getRandomColor(random),
        },
        geometry: {
            type: "GeometryCollection",
            geometries: [
                {
                    type: "Point",
                    coordinates: headPosition,
                },
                {
                    type: "LineString",
                    coordinates,
                },
            ],
        },
    };
};

/**
 * Create random well heads
 */
export const createSyntheticWellHeads = (count = 100): Point3D[] => {
    const random = createRandom();
    const wellHeads: Point3D[] = [];
    for (let i = 0; i < count; i++) {
        const dx = random() * 10000 - 2000;
        const dy = random() * 8000 - 2000;
        const headPosition: Point3D = [456000 + dx, 6785000 + dy, 0];
        wellHeads.push(headPosition);
    }
    return wellHeads;
};

// A pool of random well heads; fewer than trajectories in order to create clusters
const SYNTHETIC_WELL_HEADS = createSyntheticWellHeads();

export const createSyntheticWellCollection = (
    wellCount = 1000,
    wellHeadCount = 100,
    {
        sampleCount,
        segmentLength,
        dipDeviationMagnitude,
        zIncreasingDownwards,
    }: TrajectorySimulationProps = {
        sampleCount: 20,
        segmentLength: 150,
        dipDeviationMagnitude: 20,
        zIncreasingDownwards: false,
    }
): WellFeatureCollection => {
    const random = createRandom();
    const wellHeads = SYNTHETIC_WELL_HEADS.slice(0, wellHeadCount);

    const wells: WellFeature[] = [];

    for (let i = 0; i < wellCount; i++) {
        // Draw from collection of heads in order to create clusters
        const wellPerClusterCount = Math.trunc(wellCount / wellHeadCount) + 1;
        const headIndex = Math.trunc(i / wellPerClusterCount);
        const headPosition = wellHeads[headIndex];

        const syntheticWell = createSyntheticWell(
            random,
            i,
            headPosition,
            sampleCount,
            segmentLength,
            dipDeviationMagnitude,
            zIncreasingDownwards
        );
        wells.push(syntheticWell);
    }

    return {
        type: "FeatureCollection",
        features: wells,
    };
};

export const useSyntheticWellCollection = (
    wellCount = 1000,
    wellHeadCount = 100,
    {
        sampleCount,
        segmentLength,
        dipDeviationMagnitude,
        zIncreasingDownwards,
    }: TrajectorySimulationProps = {
        sampleCount: 20,
        segmentLength: 150,
        dipDeviationMagnitude: 10,
        zIncreasingDownwards: false,
    }
): WellFeatureCollection =>
    React.useMemo(
        () =>
            createSyntheticWellCollection(wellCount, wellHeadCount, {
                sampleCount,
                segmentLength,
                dipDeviationMagnitude,
                zIncreasingDownwards,
            }),
        [
            wellCount,
            wellHeadCount,
            sampleCount,
            segmentLength,
            dipDeviationMagnitude,
            zIncreasingDownwards,
        ]
    );

export const SYNTHETIC_WELLS = createSyntheticWellCollection(1000);

export const getSyntheticWells = (wellCount: number): WellFeatureCollection => {
    const wells = SYNTHETIC_WELLS.features.slice(0, wellCount);
    return {
        type: "FeatureCollection",
        features: wells,
    };
};
