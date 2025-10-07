import { all, create } from "mathjs";
import type { Point3D } from "../../utils";
import type { Color } from "@deck.gl/core";
import type {
    WellFeature,
    WellFeatureCollection,
} from "../../layers/wells/types";
import type { TrajectorySimulationProps } from "../types/trajectory";
import React from "react";

const math = create(all, { randomSeed: "1984" });
const randomFunc = math?.random ? math.random : Math.random;

/**
 * Generate a random deviation
 * @param magnitude maximum deviation in degrees
 * @returns deviation in radians
 */
const getRandomDeviation = (magnitude = 10, mean = 5) => {
    return (randomFunc() * (mean * 2 - magnitude * 0.5) * Math.PI) / 180;
};

const getRandomColor = (): Color => {
    const r = 100 + Math.floor(randomFunc() * 155);
    const g = 100 + Math.floor(randomFunc() * 155);
    const b = 100 + Math.floor(randomFunc() * 155);
    return [r, g, b, 255];
};

const createSyntheticWell = (
    index: number,
    headPosition: Point3D,
    sampleCount = 20,
    segmentLength = 150,
    dipDeviationMagnitude = 10
): WellFeature => {
    // Create a random well name
    const name = `Well ${index}`;

    const avgDipDeviation = randomFunc() * dipDeviationMagnitude;
    const avgAzimuthDeviation = randomFunc() * 5 - 2.5;
    const maxDip = Math.PI * 0.5 + 0.05;

    // Create a random well geometry
    const coordinates = [headPosition];

    // Lead with at least three vertical segments
    const leadCount = Math.trunc(randomFunc() * (sampleCount - 2)) + 2;
    for (let i = 0; i < leadCount; i++) {
        const x = coordinates[coordinates.length - 1][0];
        const y = coordinates[coordinates.length - 1][1];
        const z = coordinates[coordinates.length - 1][2] + segmentLength;
        coordinates.push([x, y, z]);
    }

    let previousAzimuth = randomFunc() * Math.PI * 2;
    let previousDip = 0;

    for (let i = 0; i < sampleCount - leadCount; i++) {
        const prevSample = coordinates[coordinates.length - 1];
        const azimuth =
            previousAzimuth + getRandomDeviation(5, avgAzimuthDeviation);
        const dip = Math.min(
            previousDip +
                getRandomDeviation(dipDeviationMagnitude, avgDipDeviation),
            maxDip
        );
        const x =
            prevSample[0] + segmentLength * Math.cos(azimuth) * Math.sin(dip);
        const y =
            prevSample[1] + segmentLength * Math.sin(azimuth) * Math.sin(dip);
        const z = prevSample[2] + segmentLength * Math.cos(dip);

        coordinates.push([x, y, z]);
        previousAzimuth = azimuth;
        previousDip = dip;
    }

    return {
        type: "Feature",
        properties: {
            name,
            md: [],
            color: getRandomColor(),
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
const createSyntheticWellHeads = (count = 100): Point3D[] => {
    const wellHeads: Point3D[] = [];
    for (let i = 0; i < count; i++) {
        const dx = randomFunc() * 10000 - 2000;
        const dy = randomFunc() * 8000 - 2000;
        const headPosition: Point3D = [456000 + dx, 6785000 + dy, 0];
        wellHeads.push(headPosition);
    }
    return wellHeads;
};

// A pool of random well heads; fewer than trajectories in order to create clusters
const SYNTHETIC_WELL_HEADS = createSyntheticWellHeads();

const createSyntheticWellCollection = (
    wellCount = 1000,
    wellHeadCount = 100,
    {
        sampleCount,
        segmentLength,
        dipDeviationMagnitude,
    }: TrajectorySimulationProps = {
        sampleCount: 20,
        segmentLength: 150,
        dipDeviationMagnitude: 20,
    }
): WellFeatureCollection => {
    const wellHeads = SYNTHETIC_WELL_HEADS.slice(0, wellHeadCount);

    const wells: WellFeature[] = [];

    for (let i = 0; i < wellCount; i++) {
        // Draw from collection of heads in order to create clusters
        const wellPerClusterCount = Math.trunc(wellCount / wellHeadCount) + 1;
        const headIndex = Math.trunc(i / wellPerClusterCount);
        const headPosition = wellHeads[headIndex];

        const syntheticWell = createSyntheticWell(
            i,
            headPosition,
            sampleCount,
            segmentLength,
            dipDeviationMagnitude
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
    }: TrajectorySimulationProps = {
        sampleCount: 20,
        segmentLength: 150,
        dipDeviationMagnitude: 10,
    }
): WellFeatureCollection =>
    React.useMemo(
        () =>
            createSyntheticWellCollection(wellCount, wellHeadCount, {
                sampleCount,
                segmentLength,
                dipDeviationMagnitude,
            }),
        [
            wellCount,
            wellHeadCount,
            sampleCount,
            segmentLength,
            dipDeviationMagnitude,
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
