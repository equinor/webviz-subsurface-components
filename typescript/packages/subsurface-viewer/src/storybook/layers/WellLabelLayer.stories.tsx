import type { Meta, StoryObj } from "@storybook/react";
import type { Feature, FeatureCollection } from "geojson";
import { all, create } from "mathjs";
import React from "react";
import { AxesLayer, WellsLayer } from "../../layers";
import type { WellLabelLayerProps } from "../../layers/wells/layers/wellLabelLayer";
import {
    LabelOrientation,
    WellLabelLayer,
} from "../../layers/wells/layers/wellLabelLayer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import { default3DViews } from "../sharedSettings";
import { getRgba } from "../util/color";

type WellCount = { wellCount: number };

const stories: Meta = {
    title: "SubsurfaceViewer / Well Label Layer",
    parameters: {
        docs: {
            description: {
                component: "Layer for displaying well labels",
            },
        },
    },
    argTypes: {
        wellCount: {
            control: {
                type: "range",
                min: 1,
                max: 1000,
                step: 1,
            },
        },
        getPositionAlongPath: {
            control: {
                type: "range",
                min: 0,
                max: 100,
                step: 1,
            },
        },
    },
    args: {
        wellCount: 10,
        getPositionAlongPath: 50,
    },
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

const createSyntheticWell = (index: number): Feature => {
    // Create a random well name
    const name = `Well ${index}`;

    const sampleCount = 10;

    const dx = randomFunc() * 10000 - 2000;
    const dy = randomFunc() * 8000 - 2000;
    const headPosition = [456000 + dx, 6785000 + dy, 0];

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

const SYNTHETIC_WELLS = createSyntheticWellCollection(1000);

const AXES_LAYER = new AxesLayer({
    id: "axes-layer",
    bounds: [450000, 6781000, 0, 464000, 6791000, 3500],
});

const DEFAULT_LABEL_PROPS = {
    id: "well-labels",
    data: SYNTHETIC_WELLS.features,
};

const getSyntheticWells = (wellCount: number): FeatureCollection => {
    const wells = SYNTHETIC_WELLS.features.slice(0, wellCount);
    return {
        type: "FeatureCollection",
        features: wells,
    };
};

export const Default: StoryObj<WellCount> = {
    render: ({ wellCount }) => {
        const data = getSyntheticWells(wellCount);

        const wellLayer = new WellsLayer({
            data,
            wellNameVisible: false,
        });

        const labelLayer = new WellLabelLayer({
            ...DEFAULT_LABEL_PROPS,
            data: data.features,
        });

        const propsWithLayers = {
            id: "default",
            layers: [AXES_LAYER, wellLayer, labelLayer],
            views: default3DViews,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
};

export const LabelPosition: StoryObj<WellCount & WellLabelLayerProps> = {
    render: ({ wellCount, getPositionAlongPath }) => {
        const data = getSyntheticWells(wellCount);

        const wellLayer = new WellsLayer({
            data,
            wellNameVisible: false,
        });

        const labelLayer = new WellLabelLayer({
            ...DEFAULT_LABEL_PROPS,
            getPositionAlongPath,
            data: data.features,
        });

        const propsWithLayers = {
            id: "position",
            layers: [AXES_LAYER, wellLayer, labelLayer],
            views: default3DViews,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
};

export const LabelAutoPosition: StoryObj<WellCount> = {
    render: ({ wellCount }) => {
        const data = getSyntheticWells(wellCount);

        const wellLayer = new WellsLayer({
            data,
            wellNameVisible: false,
        });

        const labelLayer = new WellLabelLayer({
            ...DEFAULT_LABEL_PROPS,
            autoPosition: true,
            data: data.features,
        });

        const layers = [AXES_LAYER, wellLayer, labelLayer];

        const propsWithLayers = {
            id: "position",
            layers,
            views: default3DViews,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
};

export const TangentOrientation: StoryObj<WellCount & WellLabelLayerProps> = {
    render: ({ wellCount, getPositionAlongPath }) => {
        const data = getSyntheticWells(wellCount);

        const wellLayer = new WellsLayer({
            data,
            wellNameVisible: false,
        });

        const labelLayer = new WellLabelLayer({
            ...DEFAULT_LABEL_PROPS,
            orientation: LabelOrientation.TANGENT,
            data: data.features,
            getPositionAlongPath,
        });

        const layers = [AXES_LAYER, wellLayer, labelLayer];

        const propsWithLayers = {
            id: "orientation",
            layers,
            views: default3DViews,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
};

export const LabelStyle: StoryObj<
    WellCount &
        WellLabelLayerProps & {
            color: string;
            borderColor: string;
            bgColor: string;
        }
> = {
    render: ({
        wellCount,
        getPositionAlongPath,
        getSize,
        orientation,
        background,
        getBorderWidth,
        ...props
    }) => {
        const data = getSyntheticWells(wellCount);

        const wellLayer = new WellsLayer({
            data,
            wellNameVisible: false,
        });

        const labelLayer = new WellLabelLayer({
            ...DEFAULT_LABEL_PROPS,
            getPositionAlongPath,
            data: data.features,
            getSize,
            getColor: getRgba(props.color),
            background,
            getBorderColor: getRgba(props.borderColor),
            getBorderWidth,
            getBackgroundColor: getRgba(props.bgColor),
            orientation,
        });

        const layers = [AXES_LAYER, wellLayer, labelLayer];

        const propsWithLayers = {
            id: "style",
            layers,
            views: default3DViews,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
    args: {
        getSize: 15,
        orientation: LabelOrientation.HORIZONTAL,
        color: "yellow",
        background: true,
        borderColor: "black",
        getBorderWidth: 2,
        bgColor: "grey",
    },
    argTypes: {
        getSize: {
            control: {
                type: "range",
                min: 0,
                max: 50,
                step: 1,
            },
        },
        orientation: {
            options: ["horizontal", "tangent"],
            control: {
                type: "select",
            },
        },
    },
};

export default stories;
