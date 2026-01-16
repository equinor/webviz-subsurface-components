import type { Meta, StoryObj } from "@storybook/react";
import type { SyntheticEvent } from "react";
import React, { useState } from "react";

import { Slider } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { FeatureCollection, GeometryCollection } from "geojson";

import type { ScaleHandler } from "@emerson-eps/color-tables/";
import {
    ColorLegend,
    colorTables,
    createColorMapFunction as createColormapFunction,
} from "@emerson-eps/color-tables";
import { NativeSelect } from "@equinor/eds-core-react";

import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { MapMouseEvent } from "../../components/Map";

import AxesLayer from "../../layers/axes/axesLayer";
import type { WellFeatureCollection } from "../../layers/wells/types";
import type { WellsLayerProps } from "../../layers/wells/wellsLayer";
import WellsLayer from "../../layers/wells/wellsLayer";

import { Axes2DLayer } from "../../layers";
import {
    default3DViews,
    defaultStoryParameters,
    volveWellsBounds,
    volveWellsFromResourcesLayer,
    volveWellsResources,
} from "../sharedSettings";

import { View, OrbitView, OrthographicView } from "@deck.gl/core";
import { PathStyleExtension } from "@deck.gl/extensions";
import { PathLayer } from "@deck.gl/layers";
import { useAbscissaTransform } from "../../layers/wells/hooks/useAbscissaTransform";
import type { WellLabelLayerProps } from "../../layers/wells/layers/wellLabelLayer";
import { LabelOrientation } from "../../layers/wells/layers/wellLabelLayer";
import {
    coarsenWells,
    DEFAULT_TOLERANCE,
} from "../../layers/wells/utils/spline";
import {
    LABEL_MERGE_RADIUS_ARGTYPES,
    LABEL_ORIENTATION_ARGTYPES,
    LABEL_POSITION_ARGTYPES,
    LABEL_SIZE_ARGTYPES,
    TRAJECTORY_SIMULATION_ARGTYPES,
    WELL_COUNT_ARGTYPES,
} from "../constant/argTypes";
import type { TrajectorySimulationProps, WellCount } from "../types/well";
import { getRgba } from "../util/color";
import {
    getSyntheticWells,
    useSyntheticWellCollection,
} from "../util/wellSynthesis";
import { SectionView } from "../../views/sectionView";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Wells Layer",
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

const PREFIX = "VolveWells";

const testWellWithDuplicates: WellFeatureCollection = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [0, 0],
                    },
                    {
                        type: "LineString",
                        coordinates: [
                            [0, 0, -100],
                            [0, 0, -200],
                            [0, 0, -300],
                            [0, 0, -400],
                            [0, 0, -400],
                            [0, 0, -400],
                            [0, 0, -500],
                            [0, 0, -600],
                            [0, 0, -700],
                            [0, 0, -800],
                        ],
                    },
                ],
            },
            // WellFeatureCollection type means the properties here are typed!
            properties: {
                name: "wl6",
                color: [255, 255, 0, 255],
                md: [[0, 1, 2, 3, 4, 5, 8, 9]],
            },
        },
    ],
};

const classes = {
    main: `${PREFIX}-main`,
    annotation: `${PREFIX}-annotation`,
};

const Root = styled("div")({
    [`& .${classes.main}`]: {
        height: 500,
        border: "1px solid black",
        position: "relative",
    },
    [`& .${classes.annotation}`]: {
        marginLeft: "100px",
    },
});

const defaultProps = {
    id: "some id",
    resources: {
        ...volveWellsResources.resources,
    },
    bounds: volveWellsBounds,
};

const continuousLogsLayer = {
    ...volveWellsFromResourcesLayer,
    refine: false,
    outline: false,
    logData: "./volve_logs.json",
    logrunName: "BLOCKING",
    logName: "PORO",
    logColor: "Physics",
};

// Volve wells default example.
export const VolveWells: StoryObj<typeof SubsurfaceViewer> = {
    args: { ...defaultProps, layers: [volveWellsFromResourcesLayer] },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Volve wells example",
            },
        },
    },
};

// Volve wells with mouseCallback function without logs
const VolveWellsWithMouseCallback: React.FC<SubsurfaceViewerProps> = (
    props
) => {
    const onMouseEvent = React.useCallback((event: MapMouseEvent) => {
        console.log(event);
    }, []);
    return (
        <>
            <SubsurfaceViewer {...props} onMouseEvent={onMouseEvent} />
            <div
                style={{
                    position: "absolute",
                    marginLeft: 200,
                }}
            ></div>
        </>
    );
};

export const volveWells2: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "volve-wells",
        resources: {
            wellsData: "./volve_wells.json",
        },
        bounds: volveWellsBounds,
        layers: [
            {
                "@@type": "WellsLayer",
                data: "@@#resources.wellsData",
            },
            {
                "@@type": "Axes2DLayer",
                id: "axes-layer2D",
                axisColor: [100, 100, 255],
                marginH: 100, // Horizontal margin (in pixels)
                marginV: 40, // Vertical margin (in pixels)
            },
        ],
    },
    render: (args) => <VolveWellsWithMouseCallback {...args} />,
    tags: ["no-test"],
};

// Volve wells with logs.
//
export const DiscreteWellLogs: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        layers: [
            {
                ...volveWellsFromResourcesLayer,
                refine: false,
                outline: false,
                logData: "volve_blocking_zonelog_logs.json",
                logrunName: "BLOCKING",
                logName: "ZONELOG",
                logColor: "Stratigraphy",
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Volve wells example with well logs.",
            },
        },
    },
};

export const ContinuousWellLogs: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        layers: [continuousLogsLayer],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Volve wells example with well logs.",
            },
        },
    },
};

export const DashedWells: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        layers: [
            {
                ...volveWellsFromResourcesLayer,
                lineStyle: { dash: true },
                refine: false,
                outline: false,
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Volve wells example with default dashed well trajectories.",
            },
        },
    },
};

// Volve wells default example.
export const MultipleVolveWells: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "volve-wells",
        resources: {
            wellsData: "./volve_wells_1.json",
            wellsData2: "./volve_wells_2.json",
        },
        bounds: volveWellsBounds,
        layers: [
            {
                "@@type": "WellsLayer",
                data: "@@#resources.wellsData",
                id: "id1",
            },
            {
                "@@type": "WellsLayer",
                data: "@@#resources.wellsData2",
                id: "id2",
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Multiple Volve wells example",
            },
        },
    },
};

export const CustomColoredWells: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        layers: [
            {
                ...volveWellsFromResourcesLayer,
                lineStyle: { color: [255, 0, 0, 255], dash: [10, 3] },
                wellHeadStyle: { color: [255, 0, 0, 255] },
                refine: false,
                outline: false,
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Volve wells example with dashed style and red trajectories, with custom style.",
            },
        },
    },
};

export const CustomWidthWells: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        layers: [
            {
                ...volveWellsFromResourcesLayer,
                lineStyle: { width: 10 },
                refine: false,
                outline: false,
            },
        ],
    },
};

const WellsWithResetButton: React.FC<SubsurfaceViewerProps> = (props) => {
    const [editedData, setEditedData] = React.useState(props.editedData);
    const [triggerResetMultipleWells, setTriggerResetMultipleWells] =
        React.useState<number>(0);
    const handleChange1 = () => {
        setTriggerResetMultipleWells(triggerResetMultipleWells + 1);
    };

    React.useEffect(() => {
        setEditedData(props.editedData);
    }, [props.editedData]);

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer
                    {...props}
                    editedData={editedData}
                    setProps={(updatedProps) => {
                        setEditedData(updatedProps);
                    }}
                    triggerResetMultipleWells={triggerResetMultipleWells}
                />
            </div>
            <button onClick={handleChange1}> Reset Multiple Wells </button>
        </Root>
    );
};

export const VolveWellsWithResetButton: StoryObj<typeof WellsWithResetButton> =
    {
        args: {
            id: "volve-wells",
            resources: {
                wellsData: "./volve_wells.json",
            },
            bounds: volveWellsBounds,
            layers: [
                {
                    "@@type": "WellsLayer",
                    data: "@@#resources.wellsData",
                },
            ],
        },
        render: (args) => <WellsWithResetButton {...args} />,
    };

function wellheadSizeCallback(object: Record<string, Record<string, unknown>>) {
    if ((object["properties"]["name"] as string).match("15/9-19")) return 0;
    else return 8;
}

function colorCallback(object: Record<string, Record<string, unknown>>) {
    if ((object["properties"]["name"] as string).match("15/9-F-10"))
        return [0, 0, 0, 0];
    else return object["properties"]["color"];
}

function dashCallback(object: Record<string, Record<string, unknown>>) {
    if ((object["properties"]["name"] as string).match("15/9-19"))
        return [1.5, 1.5];
    else if (object["properties"]["name"] === "15/9-F-15") return true;
    else return false;
}

function widthCallback(object: Record<string, Record<string, unknown>>) {
    if ((object["properties"]["name"] as string).match("15/9-F-1")) return 3;
    else if (object["properties"]["name"] === "15/9-F-4") return 8;
    else return 5;
}

export const CallbackStyledWells: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        layers: [
            {
                ...volveWellsFromResourcesLayer,
                lineStyle: {
                    color: colorCallback,
                    dash: dashCallback,
                    width: widthCallback,
                },
                wellHeadStyle: {
                    size: wellheadSizeCallback,
                },
                refine: false,
                outline: false,
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Volve wells example with trajectory color, width and dash style supplied as callback.",
            },
        },
    },
};

export const AllTrajectoryHidden: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        layers: [
            {
                ...volveWellsFromResourcesLayer,
                lineStyle: { color: [0, 0, 0, 0] },
                refine: false,
                outline: false,
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Volve wells example with all trajectory hidden.",
            },
        },
    },
};

export const AllWellHeadsHidden: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        layers: [
            {
                ...volveWellsFromResourcesLayer,
                wellHeadStyle: { size: 0 },
                refine: false,
                outline: false,
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Volve wells example with all well heads hidden.",
            },
        },
    },
};

const testWell: FeatureCollection = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [0, 0],
                    },
                    {
                        type: "LineString",
                        coordinates: [
                            [0, 0, 0],
                            [0, 0, 1],
                            [0, 0, 2],
                            [0, 50, -50],
                            [0, 0, -100],
                            [99, 99, -150],
                            [99, 0, -250],
                        ],
                    },
                ],
            },
            properties: {
                name: "well99",
                color: [255, 255, 0, 255],
                md: [[0, 1, 2, 3, 4, 5, 8, 9]],
            },
        },
    ],
};

const BBox = [-100, -100, -250, 100, 100, 0] as [
    number,
    number,
    number,
    number,
    number,
    number,
];

const WellsRefineComponent: React.FC<SubsurfaceViewerProps> = (props) => {
    const [refineNumber, setRefineNumber] = React.useState<number>(1);

    const propsWithLayers = {
        ...props,
        layers: [
            {
                "@@type": "WellsLayer",
                data: testWell,
                refine: refineNumber,
                ZIncreasingDownwards: false,
            },
            {
                "@@type": "AxesLayer",
                ZIncreasingDownwards: false,
                bounds: BBox,
            },
        ],
    };

    const handleChange = React.useCallback(
        (_event: Event | SyntheticEvent, value: number | number[]) => {
            setRefineNumber(value as number);
        },
        []
    );

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...propsWithLayers} />
            </div>
            <Slider
                min={1}
                max={10}
                defaultValue={1}
                step={1}
                onChange={handleChange}
                valueLabelDisplay={"auto"}
            />
        </Root>
    );
};

export const WellsRefine: StoryObj<typeof WellsRefineComponent> = {
    args: {
        id: "refine-wells",
        cameraPosition: {
            rotationOrbit: -45,
            rotationX: 15,
            zoom: BBox,
            target: undefined,
        },
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "3D wells example",
            },
        },
    },
    render: (args) => <WellsRefineComponent {...args} />,
    tags: ["no-test"],
};

export const Wells3d: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        layers: [
            {
                ...volveWellsFromResourcesLayer,
                wellHeadStyle: { size: 4 },
                wellLabel: {
                    getSize: 9,
                    background: true,
                },
            },
        ],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "3D wells example",
            },
        },
    },
};

export const VerticalWellWithDuplicates: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "well_176",
        bounds: [-150, -150, 150, 150],
        layers: [
            new WellsLayer({
                data: testWellWithDuplicates,
                ZIncreasingDownwards: false,
            }),
            new AxesLayer({
                id: "axes-layer",
                bounds: [-100, -100, -500, 100, 100, 0],
                ZIncreasingDownwards: false,
            }),
        ],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "One single vertical well",
            },
        },
    },
};

// Gullfaks wells.
const SimplifiedRenderingComponent: React.FC<SubsurfaceViewerProps> = (
    props
) => {
    const [simplifiedRendering, setSimplifiedRendering] =
        React.useState<boolean>(false);

    const propsWithLayers = {
        ...props,
        onDragStart: () => setSimplifiedRendering(true),
        onDragEnd: () => setSimplifiedRendering(false),
        layers: [
            new WellsLayer({
                data: "./gullfaks.json",
                wellNameAtTop: true,
                wellHeadStyle: { size: 4 },
                refine: true,
                outline: true,
                simplifiedRendering, // If true will cause wellslayer to draw simplified.
                ZIncreasingDownwards: false,
            }),
            new AxesLayer({
                id: "axes-layer",
                bounds: [450000, 6781000, 0, 464000, 6791000, 3500],
            }),
        ],
    };

    return <SubsurfaceViewer {...propsWithLayers} />;
};

export const SimplifiedRendering: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "gullfaks",
        bounds: [450000, 6781000, 464000, 6791000] as [
            number,
            number,
            number,
            number,
        ],
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "3D gullfaks wells example",
            },
        },
    },
    render: (args) => <SimplifiedRenderingComponent {...args} />,
};

/**
 * A story that demonstrates styling of well labels.
 */
export const WellLabelStyle: StoryObj<
    WellLabelLayerProps & {
        color: string;
        borderColor: string;
        bgColor: string;
    }
> = {
    args: {
        getSize: 10,
        orientation: LabelOrientation.HORIZONTAL,
        color: "black",
        background: true,
        borderColor: "black",
        getBorderWidth: 1,
        bgColor: "white",
        getPositionAlongPath: 0,
        mergeLabels: true,
        mergeRadius: 100,
        autoPosition: true,
    },

    render: (args) => {
        const wellLabelProps: WellsLayerProps["wellLabel"] = {
            getPositionAlongPath: args.getPositionAlongPath,
            getSize: args.getSize,
            getColor: getRgba(args.color),
            getBorderColor: getRgba(args.borderColor),
            getBackgroundColor: getRgba(args.bgColor),
            getBorderWidth: args.getBorderWidth,
            orientation: args.orientation,
            background: args.background,
            visible: true,
            autoPosition: args.autoPosition,

            // MergedTextLayer options
            mergeLabels: args.mergeLabels,
            mergeRadius: args.mergeRadius,

            // Disable transitions as they are too slow for this story, on the test runner
            transitions: {},
        };

        const wellLayerProps = {
            data: "./gullfaks.json",
            wellHeadStyle: { size: 5 },
            ZIncreasingDownwards: false,
            wellLabel: wellLabelProps,
        };

        const wellLayer2d = new WellsLayer({
            ...wellLayerProps,
            id: "wells-2d",
        });

        const wellLayer3d = new WellsLayer({
            ...wellLayerProps,
            id: "wells-3d",
        });

        const layers = [wellLayer2d, wellLayer3d];

        // Viewport is reset if identity of `views` object changes, so we need to memoize it.
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const views = React.useMemo(
            () => ({
                layout: [1, 2] as [number, number],
                viewports: [
                    {
                        id: "viewport1",
                        layerIds: ["wells-3d"],
                        viewType: OrbitView,
                    },
                    {
                        id: "viewport2",
                        layerIds: ["wells-2d"],
                        viewType: OrthographicView,
                    },
                ],
            }),
            []
        );

        return (
            <SubsurfaceViewer
                id="well-label-style"
                layers={layers}
                views={views}
            />
        );
    },

    argTypes: {
        ...LABEL_POSITION_ARGTYPES,
        ...LABEL_SIZE_ARGTYPES,
        ...LABEL_ORIENTATION_ARGTYPES,
        ...LABEL_MERGE_RADIUS_ARGTYPES,
    },
};

const CoarseWellFactorComponent: React.FC<{
    coarseWellsToleranceFactor: number;
    is3D: boolean;
}> = ({ is3D, ...args }) => {
    const [coarseWellsToleranceFactor, setCoarseWellsToleranceFactor] =
        useState<number>(DEFAULT_TOLERANCE);
    const [n, setN] = useState<number>(1);

    if (coarseWellsToleranceFactor != args.coarseWellsToleranceFactor) {
        setN((n) => n + 1);
        setCoarseWellsToleranceFactor(args.coarseWellsToleranceFactor);
    }

    const referenceWellProps = {
        id: "reference-wells",
        data: "./gullfaks.json",
        wellNameVisible: true,
        wellNameSize: 9,
        wellHeadStyle: { size: 4 },
        ZIncreasingDownwards: false,
        dataTransform: undefined,
    };

    const referenceWells = new WellsLayer({
        ...referenceWellProps,
    });

    const simplifiedWells = new WellsLayer({
        ...referenceWellProps,
        id: "simplified-wells",
        data: n % 2 ? "./gullfaks.json" : "./gullfaks.json ", // Note: trick needed to force dataTransform to recalculate.
        // eslint-disable-next-line
        // @ts-ignore
        dataTransform: (dataIn) => {
            // Simplify well paths by reducing number of segments/nodes.
            const data = dataIn as FeatureCollection<GeometryCollection>;

            return coarsenWells(data, coarseWellsToleranceFactor);
        },
    });

    const axes = new AxesLayer({
        id: "axes-layer",
        bounds: [450000, 6781000, 0, 464000, 6791000, 3500],
    });

    const views = React.useMemo(
        () => ({
            layout: [1, 2] as [number, number],
            viewports: [
                {
                    id: "viewport1",
                    layerIds: ["reference-wells", "axes-layer"],
                    viewType: is3D ? OrbitView : OrthographicView,
                    isSync: true,
                },
                {
                    id: "viewport2",
                    layerIds: ["simplified-wells", "axes-layer"],
                    viewType: is3D ? OrbitView : OrthographicView,
                    isSync: true,
                },
            ],
        }),
        [is3D]
    );

    const subsurfaceViewerArgs = {
        id: "simplify-wells",
        layers: [referenceWells, simplifiedWells, axes],
        views,
    };
    return <SubsurfaceViewer {...subsurfaceViewerArgs} />;
};

export const CoarseWellFactor: StoryObj<typeof CoarseWellFactorComponent> = {
    args: {
        coarseWellsToleranceFactor: DEFAULT_TOLERANCE,
        is3D: true,
    },
    argTypes: {
        coarseWellsToleranceFactor: {
            control: { type: "range", min: 0.01, max: 20, step: 0.01 },
        },
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Coarsen wells using &quot;dataTransform&quot;property",
            },
        },
    },
    render: (args) => <CoarseWellFactorComponent {...args} />,
};

export const Wells3dDashed: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        ...defaultProps,
        layers: [
            {
                ...volveWellsFromResourcesLayer,
                lineStyle: { dash: true },
                refine: false,
                outline: false,
            },
        ],
        views: default3DViews,
    },
    parameters: {
        docs: {
            description: {
                story: "3D dashed wells example",
            },
            ...defaultStoryParameters.docs,
        },
    },
};

const ContinuousColorTableComponent: React.FC = () => {
    const [colorTable, setColorTable] = useState("Physics");

    const mapProps = React.useMemo(() => {
        return {
            ...defaultProps,
            layers: [
                {
                    ...continuousLogsLayer,
                    logColor: colorTable,
                },
            ],
        };
    }, [colorTable]);

    const handleOnChange = (event: React.FormEvent) => {
        setColorTable((event.target as HTMLInputElement)?.value);
    };
    return (
        <>
            <NativeSelect
                id={"test"}
                label={"Color table"}
                value={colorTable}
                onChange={handleOnChange}
            >
                <option key={"Physics"}>{"Physics"}</option>
                <option key={"Rainbow"}>{"Rainbow"}</option>
            </NativeSelect>
            {
                <div style={{ height: "80vh", position: "relative" }}>
                    <SubsurfaceViewer {...mapProps} />
                </div>
            }
        </>
    );
};

export const ContinuousColorTable: StoryObj<
    typeof ContinuousColorTableComponent
> = {
    render: () => <ContinuousColorTableComponent />,
};

// colorselector for welllayer
const wellLayers = [
    {
        ...volveWellsFromResourcesLayer,
        refine: false,
        outline: false,
        logData: "./volve_logs.json",
        logrunName: "BLOCKING",
        logName: "ZONELOG",
        logColor: "Stratigraphy",
        colorMappingFunction: createColormapFunction(
            "Stratigraphy",
            true,
            true,
            []
        ),
    },
];

// prop for legend
const min = 0;
const max = 0.35;
const dataObjectName = "ZONELOG";
const position = [16, 10];
const horizontal = true;
const discreteData = {
    Above_BCU: [[], 0],
    ABOVE: [[], 1],
    H12: [[], 2],
    H11: [[], 3],
    H10: [[], 4],
    H9: [[], 5],
    H8: [[], 6],
    H7: [[], 7],
    H6: [[], 8],
    H5: [[], 9],
    H4: [[], 10],
    H3: [[], 11],
    H2: [[], 12],
    H1: [[], 13],
    BELOW: [[], 14],
};
const reverseRange = false;

//eslint-disable-next-line
const WellLayerTemplate: React.FC = (args: any) => {
    const [colorName, setColorName] = React.useState("Rainbow");

    const [isLog, setIsLog] = React.useState(false);

    const onGetColorRange = React.useCallback<ScaleHandler>((data) => {
        setColorName(data.name);
    }, []);

    // interpolation method
    const getInterpolateMethod = React.useCallback(
        (data: { isLog: boolean | ((prevState: boolean) => boolean) }) => {
            setIsLog(data.isLog);
        },
        []
    );

    const layers = [
        {
            ...args.wellLayers[0],
            colorMappingFunction: createColormapFunction(
                colorName,
                true,
                true,
                []
            ),
            logColor: colorName || wellLayers[0].logColor,
            isLog: isLog,
        },
    ];
    return (
        <div>
            <div
                style={{
                    zIndex: 999,
                    opacity: 1,
                }}
            >
                <ColorLegend
                    {...args}
                    colorTables={colorTables}
                    getScale={onGetColorRange}
                    getInterpolateMethod={getInterpolateMethod}
                />
            </div>
            <SubsurfaceViewer
                {...args}
                layers={layers}
                scale={{
                    visible: true,
                    cssStyle: { top: 10, right: 10 },
                }}
            />
        </div>
    );
};

//eslint-disable-next-line
export const LegendWithColorSelector: StoryObj<typeof WellLayerTemplate> = {
    args: {
        min,
        max,
        dataObjectName,
        position,
        horizontal,
        colorTables,
        discreteData,
        ...defaultProps,
        id: defaultProps.id,
        wellLayers,
        legend: {
            visible: false,
        },
        reverseRange,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Clicking on legend opens(toggle) the color selector component and then click on the color scale to update the layer.",
            },
        },
    },
    render: (args) => <WellLayerTemplate {...args} />,
};

const SYNTHETIC_WELLS_PROPS = {
    id: "wells",
    data: getSyntheticWells(10),
    wellLabel: {
        getSize: 10,
        background: true,
    },
};

const WELLS_UNFOLDED_DEFAULT_PROPS = {
    ...SYNTHETIC_WELLS_PROPS,
    id: "unfolded_default",
    section: true,
};

const WELLS_UNFOLDED_DEFAULT = new WellsLayer({
    ...SYNTHETIC_WELLS_PROPS,
    id: "unfolded_default",
    section: true,
});

const WELLS_FOLDED_PROPS = {
    ...SYNTHETIC_WELLS_PROPS,
    id: "folded",
    wellLabel: {
        ...SYNTHETIC_WELLS_PROPS.wellLabel,
        orientation: LabelOrientation.TANGENT,
        getPositionAlongPath: 0.9,
    },
};

const WELLS_FOLDED = new WellsLayer({
    ...SYNTHETIC_WELLS_PROPS,
    id: "folded",
    wellLabel: {
        ...SYNTHETIC_WELLS_PROPS.wellLabel,
        orientation: LabelOrientation.TANGENT,
        getPositionAlongPath: 0.9,
    },
});

/** Example well with unfolded projection */
export const UnfoldedProjection: StoryObj<
    WellCount & TrajectorySimulationProps
> = {
    args: {
        wellCount: 10,
        sampleCount: 20,
        segmentLength: 150,
        dipDeviationMagnitude: 10,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Unfolded projection",
            },
        },
    },
    argTypes: {
        ...WELL_COUNT_ARGTYPES,
        ...TRAJECTORY_SIMULATION_ARGTYPES,
    },
    render: ({
        wellCount,
        sampleCount,
        segmentLength,
        dipDeviationMagnitude,
    }) => {
        const viewerArgs: SubsurfaceViewerProps = {
            id: "some-id",
            views: {
                layout: [1, 3] as [number, number],
                viewports: [
                    {
                        id: "viewport1",
                        target: [3000, -1500],
                        viewType: SectionView,
                        zoom: -4.5,
                        layerIds: [WELLS_UNFOLDED_DEFAULT.id, "axes"],
                    },
                    {
                        id: "viewport2",
                        target: [3000, -1500],
                        viewType: SectionView,
                        zoom: -4.5,
                        layerIds: ["unfolded_custom", "axes"],
                    },
                    {
                        id: "viewport3",
                        layerIds: [WELLS_FOLDED.id, "axes", "section-path"],
                        target: [458500, 6785000],
                        zoom: -3.5,
                    },
                ],
            },
            scale: { visible: false },
            bounds: [450000, 6781000, 464000, 6791000],
        };

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const data = useSyntheticWellCollection(wellCount, 10, {
            sampleCount,
            segmentLength,
            dipDeviationMagnitude,
        });

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { transform, path } = useAbscissaTransform();

        // Use custom section transform (nearest neighbor)
        const wellsUnfoldedCustom = new WellsLayer({
            ...SYNTHETIC_WELLS_PROPS,
            id: "unfolded_custom",
            section: transform,
            wellLabel: {
                ...SYNTHETIC_WELLS_PROPS.wellLabel,
                orientation: LabelOrientation.TANGENT,
                getPositionAlongPath: 0.7,
            },
            data,
        });

        // Project the section path in the map view with a dashed polyline
        const sectionPathLayer = new PathLayer({
            id: "section-path",
            data: [{ path }],
            widthMinPixels: 1,
            extensions: [new PathStyleExtension({ dash: true })],
            getDashArray: [10, 5],
        });

        const layers = [
            new WellsLayer({ ...WELLS_FOLDED_PROPS, data }),
            new WellsLayer({ ...WELLS_UNFOLDED_DEFAULT_PROPS, data }),
            new Axes2DLayer({ id: "axes" }),
            wellsUnfoldedCustom,
            sectionPathLayer,
        ];

        return (
            <Root>
                <SubsurfaceViewer {...viewerArgs} layers={layers}>
                    {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        /* @ts-expect-error */
                        <View id="viewport1">
                            <h2 className={classes.annotation}>
                                Default unfolded projection [distance, z]
                            </h2>
                            <p className={classes.annotation}>
                                The wells are projected onto a section defined
                                by the wellbores themselves, ie. a [abscissa, z]
                                plane defined by <i>unfolding</i> the well
                                trajectories.
                            </p>
                        </View>
                    }
                    {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        /* @ts-expect-error */
                        <View id="viewport2">
                            <h2 className={classes.annotation}>
                                Custom unfolded projection [distance, z]
                            </h2>
                            <p className={classes.annotation}>
                                Demonstrates using a custom method of unfolding
                                the wells, by specifying a custom section
                                transform. This section is defined by a nearest
                                neighbor search through the wells starting with
                                the first given well.
                            </p>
                        </View>
                    }
                    {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        /* @ts-expect-error */
                        <View id="viewport3">
                            <h2 className={classes.annotation}>
                                Folded projection [x, y]
                            </h2>
                            <p className={classes.annotation}>
                                The dashed polyline shows the custom section
                                path.
                            </p>
                        </View>
                    }
                </SubsurfaceViewer>
            </Root>
        );
    },
};
