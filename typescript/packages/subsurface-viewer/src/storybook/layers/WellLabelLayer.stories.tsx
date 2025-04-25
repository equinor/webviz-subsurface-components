import type { Color } from "@deck.gl/core";
import type { Meta, StoryObj } from "@storybook/react";
import { all, create } from "mathjs";
import React from "react";
import { AxesLayer, WellsLayer } from "../../layers";
import type { Position3D } from "../../layers/utils/layerTools";
import type { WellLabelLayerProps } from "../../layers/wells/layers/wellLabelLayer";
import {
    LabelOrientation,
    WellLabelLayer,
} from "../../layers/wells/layers/wellLabelLayer";
import type {
    WellFeature,
    WellFeatureCollection,
} from "../../layers/wells/types";
import type { ViewStateType, ViewsType } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import {
    LABEL_ORIENTATION_ARGTYPES,
    LABEL_POSITION_ARGTYPES,
    LABEL_SIZE_ARGTYPES,
    TRAJECTORY_SIMULATION_ARGTYPES,
} from "../constant/argTypes";
import type { TrajectorySimulationProps } from "../types/trajectory";
import { getRgba } from "../util/color";
import { fireEvent, userEvent } from "@storybook/test";

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
            layerIds: ["well-layer", "well-labels"],
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
            layerIds: ["well-layer", "label-2d"],
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

const getRandomColor = (): Color => {
    const r = 100 + Math.floor(randomFunc() * 155);
    const g = 100 + Math.floor(randomFunc() * 155);
    const b = 100 + Math.floor(randomFunc() * 155);
    return [r, g, b, 255];
};

const createSyntheticWell = (
    index: number,
    headPosition: Position3D,
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
    const leadCount = Math.trunc(randomFunc() * (sampleCount - 3)) + 3;
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
const createSyntheticWellHeads = (count = 100): Position3D[] => {
    const wellHeads: Position3D[] = [];
    for (let i = 0; i < count; i++) {
        const dx = randomFunc() * 10000 - 2000;
        const dy = randomFunc() * 8000 - 2000;
        const headPosition: Position3D = [456000 + dx, 6785000 + dy, 0];
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
    const wellHeads = SYNTHETIC_WELL_HEADS.slice(
        0,
        wellHeadCount
    ) as Position3D[];

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

const useSyntheticWellCollection = (
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

const SYNTHETIC_WELLS = createSyntheticWellCollection(1000);

const AXES_LAYERS = [
    new AxesLayer({
        id: "axes-layer-3d",
        bounds: [450000, 6781000, 0, 464000, 6791000, 3500],
    }),
];

const DEFAULT_LABEL_PROPS = {
    id: "well-labels",
    data: SYNTHETIC_WELLS.features,
};

const getSyntheticWells = (wellCount: number): WellFeatureCollection => {
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

export const Default2: StoryObj<typeof SubsurfaceViewer> = {
    render: () => {
        const camera: ViewStateType = {
            target: [458305, 6785369, 0],
            zoom: 0,
            rotationX: 0,
            rotationOrbit: 40,
        };

        const data = getSyntheticWells(10);

        const wellLayer = new WellsLayer({
            ...WELL_LAYER_PROPS,
            data,
        });

        const labelLayer = new WellLabelLayer({
            ...DEFAULT_LABEL_PROPS,
            data: data.features,
            background: true,
            getSize: 100,
        });

        const propsWithLayers = {
            id: "default",
            cameraPosition: camera,
            layers: [...AXES_LAYERS, wellLayer, labelLayer],
            views: {
                layout: [1, 1],
                viewports: [
                    {
                        id: "view_1",
                        show3D: false,
                        layerIds: [
                            "well-layer",
                            "axes-layer-3d",
                            "well-labels",
                        ],
                    },
                ],
            } as ViewsType,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
    play: async () => {
        const delay = 500;
        const canvas = document.querySelector("canvas");

        if (canvas) {
            await userEvent.click(canvas, { delay });
        }

        if (!canvas) {
            return;
        }

        const leftViewCenterPosition = {
            x: canvas.clientLeft + canvas.clientWidth / 2,
            y: canvas.clientTop + canvas.clientHeight / 2,
        };

        await userEvent.hover(canvas, { delay });

        await fireEvent.mouseMove(canvas, { clientX: 0, clientY: 0, delay });
        await fireEvent.mouseMove(canvas, {
            clientX: leftViewCenterPosition.x,
            clientY: leftViewCenterPosition.y,
            delay,
        });
    },
};

export const LabelPosition: StoryObj<
    WellCount & WellLabelLayerProps & TrajectorySimulationProps
> = {
    render: ({
        wellCount,
        getPositionAlongPath,
        sampleCount,
        segmentLength,
        dipDeviationMagnitude,
    }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const data = useSyntheticWellCollection(wellCount, 100, {
            sampleCount,
            segmentLength,
            dipDeviationMagnitude,
        });

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
    argTypes: {
        ...LABEL_POSITION_ARGTYPES,
        ...TRAJECTORY_SIMULATION_ARGTYPES,
    },
    args: {
        getPositionAlongPath: 0.5,
        sampleCount: 20,
        segmentLength: 150,
        dipDeviationMagnitude: 10,
    },
};

export const LabelAutoPosition: StoryObj<WellCount & WellLabelLayerProps> = {
    render: ({ wellCount, getPositionAlongPath, orientation, background }) => {
        const data = getSyntheticWells(wellCount);

        const labelProps = {
            autoPosition: true,
            data: data.features,
            getPositionAlongPath,
            orientation,
            background,
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

        // Viewport is reset on views object identity change, so it needs to be memoized
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const views: ViewsType = React.useMemo(
            () => ({
                ...SPLIT_VIEWS,
                viewports: [
                    {
                        ...SPLIT_VIEWS.viewports[0],

                        // Zoom in in order to trigger auto-positioning.
                        zoom: -2,
                    },
                    {
                        ...SPLIT_VIEWS.viewports[1],
                    },
                ],
            }),
            []
        );

        const propsWithLayers = {
            id: "position",
            layers,
            views,
        };

        return <SubsurfaceViewer {...propsWithLayers} />;
    },
    argTypes: {
        ...LABEL_POSITION_ARGTYPES,
        ...LABEL_ORIENTATION_ARGTYPES,
    },
    args: {
        getPositionAlongPath: 0,
        orientation: LabelOrientation.HORIZONTAL,
        background: true,
    },
    parameters: {
        docs: {
            description: {
                story: "Auto position label along the well trajectory. The label will be repositioned if it falls outside the view.",
            },
        },
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
        getPositionAlongPath: 0.5,
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
        getPositionAlongPath: 0.5,
    },
    argTypes: {
        ...LABEL_POSITION_ARGTYPES,
        ...LABEL_SIZE_ARGTYPES,
        ...LABEL_ORIENTATION_ARGTYPES,
    },
};

export const SparseLabelPosition: StoryObj<
    WellCount & WellLabelLayerProps & TrajectorySimulationProps
> = {
    render: ({
        wellCount,
        getPositionAlongPath,
        sampleCount,
        segmentLength,
        dipDeviationMagnitude,
    }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const data = useSyntheticWellCollection(wellCount, 100, {
            sampleCount,
            segmentLength,
            dipDeviationMagnitude,
        });

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
    argTypes: {
        ...LABEL_POSITION_ARGTYPES,
        ...TRAJECTORY_SIMULATION_ARGTYPES,
    },
    args: {
        getPositionAlongPath: 0.5,
        sampleCount: 5,
        segmentLength: 600,
        dipDeviationMagnitude: 80,
    },
    parameters: {
        docs: {
            description: {
                story: "Label position along a sparsely sampled well trajectory.",
            },
        },
    },
};

export default stories;
