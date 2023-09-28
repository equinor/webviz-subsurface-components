/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { ComponentStory, ComponentMeta } from "@storybook/react";
import { NativeSelect } from "@equinor/eds-core-react";
import {
    createColorMapFunction,
    ColorLegend,
    colorTables,
} from "@emerson-eps/color-tables";
import type { MapMouseEvent } from "../../components/Map";
import WellsLayer from "./wellsLayer";
import AxesLayer from "../axes/axesLayer";

const PREFIX = "VolveWells";

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

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Wells Layer",
} as ComponentMeta<typeof SubsurfaceViewer>;

const Template: ComponentStory<typeof SubsurfaceViewer> = (args) => (
    <SubsurfaceViewer {...args} />
);

const defaultProps = {
    id: "volve-wells",
    resources: {
        wellsData: "./volve_wells.json",
    },
    bounds: [432150, 6475800, 439400, 6481500] as [
        number,
        number,
        number,
        number,
    ],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
        },
    ],
};

const continuousLogsLayer = {
    ...defaultProps.layers[0],
    refine: false,
    outline: false,
    logData: "./volve_logs.json",
    logrunName: "BLOCKING",
    logName: "PORO",
    logColor: "Physics",
};

// Volve wells default example.
export const VolveWells = Template.bind({});
VolveWells.args = defaultProps;
VolveWells.parameters = {
    docs: {
        description: {
            story: "Volve wells example",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

// Volve wells with mouseCallback function without logs
const VolveWellsWithMouseCallback: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    const onMouseEvent = React.useCallback((event: MapMouseEvent) => {
        console.log(event);
    }, []);
    return (
        <>
            <SubsurfaceViewer {...args} onMouseEvent={onMouseEvent} />
            <div
                style={{
                    position: "absolute",
                    marginLeft: 200,
                }}
            ></div>
        </>
    );
};

export const volveWells2 = VolveWellsWithMouseCallback.bind({});

volveWells2.args = {
    id: "volve-wells",
    resources: {
        wellsData: "./volve_wells.json",
    },
    bounds: [432150, 6475800, 439400, 6481500] as [
        number,
        number,
        number,
        number,
    ],
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
};

// Volve wells with logs.
//
export const DiscreteWellLogs = Template.bind({});
DiscreteWellLogs.args = {
    ...defaultProps,
    layers: [
        {
            ...defaultProps.layers[0],
            refine: false,
            outline: false,
            logData: "volve_blocking_zonelog_logs.json",
            logrunName: "BLOCKING",
            logName: "ZONELOG",
            logColor: "Stratigraphy",
        },
    ],
};
DiscreteWellLogs.parameters = {
    docs: {
        description: {
            story: "Volve wells example with well logs.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const ContinuousWellLogs = Template.bind({});
ContinuousWellLogs.args = {
    ...defaultProps,
    layers: [continuousLogsLayer],
};
ContinuousWellLogs.parameters = {
    docs: {
        description: {
            story: "Volve wells example with well logs.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const DashedWells = Template.bind({});
DashedWells.args = {
    ...defaultProps,
    layers: [
        {
            ...defaultProps.layers[0],
            lineStyle: { dash: true },
            refine: false,
            outline: false,
        },
    ],
};
DashedWells.parameters = {
    docs: {
        description: {
            story: "Volve wells example with default dashed well trajectories.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

// Volve wells default example.
export const MultipleVolveWells = Template.bind({});
MultipleVolveWells.args = {
    id: "volve-wells",
    resources: {
        wellsData: "./volve_wells_1.json",
        wellsData2: "./volve_wells_2.json",
    },
    bounds: [432150, 6475800, 439400, 6481500] as [
        number,
        number,
        number,
        number,
    ],
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
};

MultipleVolveWells.parameters = {
    docs: {
        description: {
            story: "Multiple Volve wells example",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const CustomColoredWells = Template.bind({});
CustomColoredWells.args = {
    ...defaultProps,
    layers: [
        {
            ...defaultProps.layers[0],
            lineStyle: { color: [255, 0, 0, 255], dash: [10, 3] },
            wellHeadStyle: { color: [255, 0, 0, 255] },
            refine: false,
            outline: false,
        },
    ],
};

CustomColoredWells.parameters = {
    docs: {
        description: {
            story: "Volve wells example with dashed style and red trajectories, with custom style.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const CustomWidthWells = Template.bind({});
CustomWidthWells.args = {
    ...defaultProps,
    layers: [
        {
            ...defaultProps.layers[0],
            lineStyle: { width: 10 },
            refine: false,
            outline: false,
        },
    ],
};

export const VolveWellsWithResetButton: ComponentStory<
    typeof SubsurfaceViewer
> = (args) => {
    const [editedData, setEditedData] = React.useState(args.editedData);
    const [triggerResetMultipleWells, setTriggerResetMultipleWells] =
        React.useState<number>(0);
    const handleChange1 = () => {
        setTriggerResetMultipleWells(triggerResetMultipleWells + 1);
    };

    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer
                    {...args}
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

VolveWellsWithResetButton.args = {
    id: "volve-wells",
    resources: {
        wellsData: "./volve_wells.json",
    },
    bounds: [432150, 6475800, 439400, 6481500] as [
        number,
        number,
        number,
        number,
    ],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
        },
    ],
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

export const CallbackStyledWells = Template.bind({});
CallbackStyledWells.args = {
    ...defaultProps,
    layers: [
        {
            ...defaultProps.layers[0],
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
};
CallbackStyledWells.parameters = {
    docs: {
        description: {
            story: "Volve wells example with trajectory color, width and dash style supplied as callback.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const AllTrajectoryHidden = Template.bind({});
AllTrajectoryHidden.args = {
    ...defaultProps,
    layers: [
        {
            ...defaultProps.layers[0],
            lineStyle: { color: [0, 0, 0, 0] },
            refine: false,
            outline: false,
        },
    ],
};

AllTrajectoryHidden.parameters = {
    docs: {
        description: {
            story: "Volve wells example with all trajectory hidden.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const AllWellHeadsHidden = Template.bind({});
AllWellHeadsHidden.args = {
    ...defaultProps,
    layers: [
        {
            ...defaultProps.layers[0],
            wellHeadStyle: { size: 0 },
            refine: false,
            outline: false,
        },
    ],
};
AllWellHeadsHidden.parameters = {
    docs: {
        description: {
            story: "Volve wells example with all well heads hidden.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const Wells3d = Template.bind({});
Wells3d.args = {
    ...defaultProps,
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "a",
                show3D: true,
            },
        ],
    },
};
Wells3d.parameters = {
    docs: {
        description: {
            story: "3D wells example",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const OneWell = Template.bind({});
OneWell.args = {
    id: "well_176",
    bounds: [756125, 166200, 757327, 167938],
    layers: [
        new WellsLayer({
            data: "./well_176.json",
            refine: true,
            simplifiedRendering: true,
        }),
    ],

    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "a",
                show3D: true,
            },
        ],
    },
};

OneWell.parameters = {
    docs: {
        description: {
            story: "One single well with duplicate vertexs example",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

// Gullfaks wells.
export const SimplifiedRendering: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    const [simplifiedRendering, setSimplifiedRendering] =
        React.useState<boolean>(false);

    const props = {
        ...args,
        onDragStart: () => setSimplifiedRendering(true),
        onDragEnd: () => setSimplifiedRendering(false),
        layers: [
            new WellsLayer({
                data: "./gullfaks.json",
                wellHeadStyle: { size: 4 },
                refine: true,
                outline: true,
                simplifiedRendering, // If true will cause wellslayer to draw simplified.
            }),
            new AxesLayer({
                id: "axes-layer",
                bounds: [450000, 6781000, 0, 464000, 6791000, 3500],
            }),
        ],
    };

    return <SubsurfaceViewer {...props} />;
};

SimplifiedRendering.args = {
    id: "gullfaks",
    bounds: [450000, 6781000, 464000, 6791000] as [
        number,
        number,
        number,
        number,
    ],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "the_view",
                show3D: true,
            },
        ],
    },
};

SimplifiedRendering.parameters = {
    docs: {
        description: {
            story: "3D gullfaks wells example",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const Wells3dDashed = Template.bind({});
Wells3dDashed.args = {
    ...defaultProps,
    layers: [
        {
            ...defaultProps.layers[0],
            lineStyle: { dash: true },
            refine: false,
            outline: false,
        },
    ],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "a",
                show3D: true,
            },
        ],
    },
};
Wells3dDashed.parameters = {
    docs: {
        description: {
            story: "3D dashed wells example",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const ContinuousColorTable: React.FC = () => {
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

// colorselector for welllayer
const wellLayers = [
    {
        ...defaultProps.layers[0],
        refine: false,
        outline: false,
        logData: "./volve_logs.json",
        logrunName: "BLOCKING",
        logName: "ZONELOG",
        logColor: "Stratigraphy",
        colorMappingFunction: createColorMapFunction("Stratigraphy"),
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
const wellLayerTemplate = (args: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [getColorName, setColorName] = React.useState("Rainbow");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLog, setIsLog] = React.useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const wellLayerData = React.useCallback(
        (data: React.SetStateAction<string>) => {
            setColorName(data);
        },
        []
    );

    // interpolation method
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const getInterpolateMethod = React.useCallback(
        (data: { isLog: boolean | ((prevState: boolean) => boolean) }) => {
            setIsLog(data.isLog);
        },
        []
    );

    const layers = [
        {
            ...args.wellLayers[0],
            colorMappingFunction: createColorMapFunction(getColorName),
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
export const LegendWithColorSelector: any = wellLayerTemplate.bind({});

LegendWithColorSelector.args = {
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
};

LegendWithColorSelector.parameters = {
    docs: {
        description: {
            story: "Clicking on legend opens(toggle) the color selector component and then click on the color scale to update the layer.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
