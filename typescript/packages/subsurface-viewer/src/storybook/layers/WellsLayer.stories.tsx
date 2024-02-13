/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import type { Meta, StoryObj } from "@storybook/react";
import type { SyntheticEvent } from "react";
import React, { useState } from "react";

import { Slider } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { FeatureCollection } from "geojson";

import {
    ColorLegend,
    colorTables,
    createColorMapFunction,
} from "@emerson-eps/color-tables";
import { NativeSelect } from "@equinor/eds-core-react";

import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { MapMouseEvent } from "../../components/Map";
import AxesLayer from "../../layers/axes/axesLayer";
import WellsLayer from "../../layers/wells/wellsLayer";

import {
    default3DViews,
    defaultStoryParameters,
    volveWellsBounds,
    volveWellsFromResourcesLayer,
    volveWellsResources,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Wells Layer",
    tags: ["no-test"],
};
export default stories;

const PREFIX = "VolveWells";

const testWellWithDuplicates = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [0, 0, 0],
                    },
                    {
                        type: "LineString",
                        coordinates: [
                            [0, 0, 0],
                            [0, 0, -100],
                            [0, 0, -200],
                            [0, 0, -300],
                            [0, 0, -400],
                            [0, 0, -500],
                            [0, 0, -600],
                            [0, 0, -700],
                            [0, 0, -800],
                        ],
                    },
                ],
            },
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
};

const Root = styled("div")({
    [`& .${classes.main}`]: {
        height: 500,
        border: "1px solid black",
        position: "relative",
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
            target: [0, 0, 0],
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
        layers: [volveWellsFromResourcesLayer],
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
        colorMappingFunction: createColorMapFunction(
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
    const [getColorName, setColorName] = React.useState("Rainbow");

    const [isLog, setIsLog] = React.useState(false);

    const wellLayerData = React.useCallback(
        (data: React.SetStateAction<string>) => {
            setColorName(data);
        },
        []
    );

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
            colorMappingFunction: createColorMapFunction(
                getColorName,
                true,
                true,
                []
            ),
            logColor: getColorName ? getColorName : wellLayers[0].logColor,
            isLog: isLog,
        },
    ];
    return (
        <div>
            <div
                style={{
                    float: "right",
                    zIndex: 999,
                    opacity: 1,
                    position: "relative",
                }}
            >
                <ColorLegend
                    {...args}
                    getColorName={wellLayerData}
                    getInterpolateMethod={getInterpolateMethod}
                />
            </div>
            <SubsurfaceViewer {...args} layers={layers} />
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
