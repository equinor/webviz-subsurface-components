import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fireEvent, userEvent } from "@storybook/test";
import { AxesLayer, WellsLayer } from "../../layers";
import type { WellLabelLayerProps } from "../../layers/wells/layers/wellLabelLayer";
import {
    LabelOrientation,
    WellLabelLayer,
} from "../../layers/wells/layers/wellLabelLayer";
import type { ViewStateType, ViewsType } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import {
    LABEL_ORIENTATION_ARGTYPES,
    LABEL_POSITION_ARGTYPES,
    LABEL_SIZE_ARGTYPES,
    TRAJECTORY_SIMULATION_ARGTYPES,
    WELL_COUNT_ARGTYPES,
} from "../constant/argTypes";
import type { TrajectorySimulationProps } from "../types/well";
import { getRgba } from "../util/color";
import {
    createSyntheticWellCollection,
    getSyntheticWells,
    useSyntheticWellCollection,
} from "../util/wellSynthesis";

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
        WELL_COUNT_ARGTYPES,
    },
    args: {
        wellCount: 10,
    },
};

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

export const WellLabelPicking: StoryObj<typeof SubsurfaceViewer> = {
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
