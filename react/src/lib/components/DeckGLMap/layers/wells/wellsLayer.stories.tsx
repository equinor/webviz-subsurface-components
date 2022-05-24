import React, { useState } from "react";
import DeckGLMap from "../../DeckGLMap";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { NativeSelect } from "@equinor/eds-core-react";

export default {
    component: DeckGLMap,
    title: "DeckGLMap / Wells Layer",
} as ComponentMeta<typeof DeckGLMap>;

const Template: ComponentStory<typeof DeckGLMap> = (args) => (
    <DeckGLMap {...args} />
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
        number
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
            logData: "./volve_logs.json",
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

export const CustomColoredWells = Template.bind({});
CustomColoredWells.args = {
    ...defaultProps,
    layers: [
        {
            ...defaultProps.layers[0],
            lineStyle: { color: [255, 0, 0, 255], dash: [10, 3] },
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
CustomColoredWells.parameters = {
    docs: {
        description: {
            story: "Volve wells example with thick lines.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

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
                    <DeckGLMap {...mapProps} />
                </div>
            }
        </>
    );
};
