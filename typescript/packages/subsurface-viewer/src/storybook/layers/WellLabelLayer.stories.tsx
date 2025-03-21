import type { Meta, StoryObj } from "@storybook/react";
import type { Feature, FeatureCollection } from "geojson";
import { all, create } from "mathjs";
import React from "react";
import { AxesLayer, WellsLayer } from "../../layers";
import { WellLabelLayer } from "../../layers/wells/layers/wellLabelLayer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import { default3DViews } from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Well Label Layer",
};

const math = create(all, { randomSeed: "1984" });
const randomFunc = math?.random ? math.random : Math.random;

/**
 * Generate a random deviation
 * @param magnitude maximum deviation in degrees
 * @returns deviation in radians
 */
const getRandomDeviation = (magnitude = 10) => {
    const magnitudeInverse = 180 / magnitude;
    return (randomFunc() * Math.PI) / magnitudeInverse;
};

const getRandomColor = () => {
    const r = 100 + Math.floor(randomFunc() * 155);
    const g = 100 + Math.floor(randomFunc() * 155);
    const b = 100 + Math.floor(randomFunc() * 155);
    return [r, g, b, 255];
};

const createSyntheticWell = (seed: number): Feature => {
    // Create a random well name
    const name = `Well ${seed}`;

    const sampleCount = 10;

    const dx = randomFunc() * 4000 - 2000;
    const dy = randomFunc() * 4000 - 2000;
    const headPosition = [458000 + dx, 6785000 + dy, 0];

    const dSegmentLength = 300;

    // Create a random well geometry
    const coordinates = [headPosition];

    let previousAzimuth = randomFunc() * Math.PI * 2;
    let previousDip = 0;

    for (let i = 0; i < sampleCount; i++) {
        const prevSample = coordinates[coordinates.length - 1];
        const azimuth = previousAzimuth + getRandomDeviation(5);
        const dip = previousDip + getRandomDeviation(10);
        const x =
            prevSample[0] + dSegmentLength * Math.cos(azimuth) * Math.sin(dip);
        const y =
            prevSample[1] + dSegmentLength * Math.sin(azimuth) * Math.sin(dip);
        const z = prevSample[2] + dSegmentLength * Math.cos(dip);

        coordinates.push([x, y, z]);
        previousAzimuth = azimuth;
        previousDip = dip;
    }

    return {
        type: "Feature",
        properties: {
            name,
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

const createSyntheticWellCollection = (count: number): FeatureCollection => {
    const wells: Feature[] = [];

    for (let i = 0; i < count; i++) {
        const syntheticWell = createSyntheticWell(i);
        wells.push(syntheticWell);
    }

    return {
        type: "FeatureCollection",
        features: wells,
    };
};

const SYNTHETIC_WELLS = createSyntheticWellCollection(10);

const SYNTHETIC_WELLS_LAYER = new WellsLayer({
    data: SYNTHETIC_WELLS,
    wellNameVisible: false,
});

const AXES_LAYER = new AxesLayer({
    id: "axes-layer",
    bounds: [450000, 6781000, 0, 464000, 6791000, 3500],
});

const DEFAULT_LAYERS = [SYNTHETIC_WELLS_LAYER, AXES_LAYER];

const DEFAULT_LABEL_PROPS = {
    id: "well-labels",
    data: SYNTHETIC_WELLS.features,
};

export const Default: StoryObj = {
    render: () => {
        const propsWithLayers = {
            id: "default",
            layers: [
                ...DEFAULT_LAYERS,
                new WellLabelLayer({
                    ...DEFAULT_LABEL_PROPS,
                    id: "default",
                }),
            ],
            views: default3DViews,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
};

export const LabelPosition: StoryObj = {
    render: () => {
        const propsWithLayers = {
            id: "position",
            layers: [
                ...DEFAULT_LAYERS,
                new WellLabelLayer({
                    ...DEFAULT_LABEL_PROPS,
                    getPositionAlongPath: 50,
                    id: "position",
                }),
            ],
            views: default3DViews,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
};

export const LabelAutoPosition: StoryObj = {
    render: () => {
        const propsWithLayers = {
            id: "position",
            layers: [
                ...DEFAULT_LAYERS,
                new WellLabelLayer({
                    ...DEFAULT_LABEL_PROPS,
                    autoPosition: true,
                }),
            ],
            views: default3DViews,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
};

export const LabelOrientation: StoryObj = {
    render: () => {
        const propsWithLayers = {
            id: "orientation",
            layers: [
                ...DEFAULT_LAYERS,
                new WellLabelLayer({
                    ...DEFAULT_LABEL_PROPS,
                    getPositionAlongPath: 50,
                    orientation: "tangent",
                    id: "orientation",
                }),
            ],
            views: default3DViews,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
};

export const LabelStyle: StoryObj = {
    render: () => {
        const propsWithLayers = {
            id: "orientation",
            layers: [
                ...DEFAULT_LAYERS,
                new WellLabelLayer({
                    ...DEFAULT_LABEL_PROPS,
                    getSize: 15,
                    getColor: [255, 255, 0, 255],
                    background: true,
                    getBorderColor: [0, 50, 0, 150],
                    getBorderWidth: 2,
                    backgroundPadding: [5, 1, 5, 1],
                    getBackgroundColor: [0, 0, 0, 100],
                }),
            ],
            views: default3DViews,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
};

export default stories;
