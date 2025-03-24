import type { ArgTypes, Meta, StoryObj } from "@storybook/react";
import type { Feature, FeatureCollection } from "geojson";
import { all, create } from "mathjs";
import React from "react";
import { Axes2DLayer, AxesLayer, WellsLayer } from "../../layers";
import type { WellLabelLayerProps } from "../../layers/wells/layers/wellLabelLayer";
import {
    LabelOrientation,
    WellLabelLayer,
} from "../../layers/wells/layers/wellLabelLayer";
import type { ViewsType } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import { getRgba } from "../util/color";
import type { Position3D } from "../../layers/utils/layerTools";

type WellCount = { wellCount: number };

const stories: Meta = {
    title: "SubsurfaceViewer / Well Label Layer",
    parameters: {
        docs: {
            description: {
                component: "Layer for displaying well labels",
            },
            story: {
                height: "700px",
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
    },
    args: {
        wellCount: 10,
    },
};

const math = create(all, { randomSeed: "1984" });
const randomFunc = math?.random ? math.random : Math.random;

const DEFAULT_VIEWS: ViewsType = {
    layout: [1, 2],
    viewports: [
        {
            id: "view_1",
            show3D: false,
            layerIds: ["well-layer", "axes-layer-2d", "well-labels"],
        },
        {
            id: "view_2",
            show3D: true,
            layerIds: ["well-layer", "axes-layer-3d", "well-labels"],
        },
    ],
};

// Split label layers into respective views
const SPLIT_VIEWS: ViewsType = {
    layout: [1, 2],
    viewports: [
        {
            id: "view_1",
            show3D: false,
            layerIds: ["well-layer", "axes-layer-2d", "label-2d"],
        },
        {
            id: "view_2",
            show3D: true,
            layerIds: ["well-layer", "axes-layer-3d", "label-3d"],
        },
    ],
};

const WELL_LAYER_PROPS = {
    id: "well-layer",
    wellNameVisible: false,
    wellHeadStyle: { size: 6 },
};

/**
 * Generate a random deviation
 * @param magnitude maximum deviation in degrees
 * @returns deviation in radians
 */
const getRandomDeviation = (magnitude = 10, mean = 5) => {
    return (randomFunc() * (mean * 2 - magnitude * 0.5) * Math.PI) / 180;
};

const getRandomColor = () => {
    const r = 100 + Math.floor(randomFunc() * 155);
    const g = 100 + Math.floor(randomFunc() * 155);
    const b = 100 + Math.floor(randomFunc() * 155);
    return [r, g, b, 255];
};

const createSyntheticWell = (
    index: number,
    headPosition: Position3D
): Feature => {
    // Create a random well name
    const name = `Well ${index}`;

    const sampleCount = 20;

    const dSegmentLength = 150;

    const avgDipDeviation = randomFunc() * 10;
    const avgAzimuthDeviation = randomFunc() * 5 - 2.5;
    const maxDip = Math.PI * 0.5 + 0.05;

    // Create a random well geometry
    const coordinates = [headPosition];

    // Lead with at least three vertical segments
    const leadCount = Math.trunc(randomFunc() * (sampleCount - 3)) + 3;
    for (let i = 0; i < leadCount; i++) {
        const x = coordinates[coordinates.length - 1][0];
        const y = coordinates[coordinates.length - 1][1];
        const z = coordinates[coordinates.length - 1][2] + dSegmentLength;
        coordinates.push([x, y, z]);
    }

    let previousAzimuth = randomFunc() * Math.PI * 2;
    let previousDip = 0;

    for (let i = 0; i < sampleCount - leadCount; i++) {
        const prevSample = coordinates[coordinates.length - 1];
        const azimuth =
            previousAzimuth + getRandomDeviation(5, avgAzimuthDeviation);
        const dip = Math.min(
            previousDip + getRandomDeviation(11, avgDipDeviation),
            maxDip
        );
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

const createSyntheticWellCollection = (
    wellCount = 1000,
    wellHeadCount = 100
): FeatureCollection => {
    // Create random well heads
    const wellHeads: Position3D[] = [];
    for (let i = 0; i < wellHeadCount; i++) {
        const dx = randomFunc() * 10000 - 2000;
        const dy = randomFunc() * 8000 - 2000;
        const headPosition: Position3D = [456000 + dx, 6785000 + dy, 0];
        wellHeads.push(headPosition);
    }

    const wells: Feature[] = [];

    for (let i = 0; i < wellCount; i++) {
        // Draw from collection of heads in order to create clusters
        const headIndex = Math.trunc(randomFunc() * wellHeads.length);
        const headPosition = wellHeads[headIndex];

        const syntheticWell = createSyntheticWell(i, headPosition);
        wells.push(syntheticWell);
    }

    return {
        type: "FeatureCollection",
        features: wells,
    };
};

const SYNTHETIC_WELLS = createSyntheticWellCollection(1000);

const AXES_LAYERS = [
    new AxesLayer({
        id: "axes-layer-3d",
        bounds: [450000, 6781000, 0, 464000, 6791000, 3500],
    }),
    new Axes2DLayer({
        id: "axes-layer-2d",
    }),
];

const DEFAULT_LABEL_PROPS = {
    id: "well-labels",
    data: SYNTHETIC_WELLS.features,
};

const LABEL_POSITION_ARGTYPES: Partial<ArgTypes<WellLabelLayerProps>> = {
    getPositionAlongPath: {
        control: {
            type: "range",
            min: 0,
            max: 100,
            step: 1,
        },
    },
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
            ...WELL_LAYER_PROPS,
            data,
        });

        const labelLayer = new WellLabelLayer({
            ...DEFAULT_LABEL_PROPS,
            data: data.features,
        });

        const propsWithLayers = {
            id: "default",
            layers: [...AXES_LAYERS, wellLayer, labelLayer],
            views: DEFAULT_VIEWS,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
};

export const LabelPosition: StoryObj<WellCount & WellLabelLayerProps> = {
    render: ({ wellCount, getPositionAlongPath }) => {
        const data = getSyntheticWells(wellCount);

        const wellLayer = new WellsLayer({
            ...WELL_LAYER_PROPS,
            data,
        });

        const labelLayer = new WellLabelLayer({
            ...DEFAULT_LABEL_PROPS,
            getPositionAlongPath,
            data: data.features,
        });

        const propsWithLayers = {
            id: "position",
            layers: [...AXES_LAYERS, wellLayer, labelLayer],
            views: DEFAULT_VIEWS,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
    argTypes: LABEL_POSITION_ARGTYPES,
    args: {
        getPositionAlongPath: 50,
    },
};

export const LabelAutoPosition: StoryObj<WellCount> = {
    render: ({ wellCount }) => {
        const data = getSyntheticWells(wellCount);

        const labelProps = {
            autoPosition: true,
            data: data.features,
        };

        const wellLayer = new WellsLayer({
            ...WELL_LAYER_PROPS,
            data,
        });

        const labelLayer2d = new WellLabelLayer({
            id: "label-2d",
            ...labelProps,
        });

        const labelLayer3d = new WellLabelLayer({
            id: "label-3d",
            ...labelProps,
        });

        const layers = [...AXES_LAYERS, wellLayer, labelLayer2d, labelLayer3d];

        const propsWithLayers = {
            id: "position",
            layers,
            views: SPLIT_VIEWS,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
};

export const TangentOrientation: StoryObj<WellCount & WellLabelLayerProps> = {
    render: ({ wellCount, getPositionAlongPath }) => {
        const data = getSyntheticWells(wellCount);

        const wellLayer = new WellsLayer({
            ...WELL_LAYER_PROPS,
            data,
        });

        const labelProps = {
            orientation: LabelOrientation.TANGENT,
            data: data.features,
            getPositionAlongPath,
        };

        const labelLayer2d = new WellLabelLayer({
            id: "label-2d",
            ...labelProps,
        });

        const labelLayer3d = new WellLabelLayer({
            id: "label-3d",
            ...labelProps,
        });

        const layers = [...AXES_LAYERS, wellLayer, labelLayer2d, labelLayer3d];

        const propsWithLayers = {
            id: "orientation",
            layers,
            views: SPLIT_VIEWS,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
    argTypes: LABEL_POSITION_ARGTYPES,
    args: {
        getPositionAlongPath: 50,
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

        const labelProps = {
            getPositionAlongPath,
            data: data.features,
            getSize,
            getColor: getRgba(props.color),
            background,
            getBorderColor: getRgba(props.borderColor),
            getBorderWidth,
            getBackgroundColor: getRgba(props.bgColor),
            orientation,
        };

        const wellLayer = new WellsLayer({
            ...WELL_LAYER_PROPS,
            data,
        });

        const labelLayer2d = new WellLabelLayer({
            ...labelProps,
            id: "label-2d",
        });

        const labelLayer3d = new WellLabelLayer({
            ...labelProps,
            id: "label-3d",
        });

        const layers = [...AXES_LAYERS, wellLayer, labelLayer2d, labelLayer3d];

        const propsWithLayers = {
            id: "style",
            layers,
            views: SPLIT_VIEWS,
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
        getPositionAlongPath: 50,
    },
    argTypes: {
        ...LABEL_POSITION_ARGTYPES,
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
