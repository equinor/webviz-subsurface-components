import React from "react";
import DeckGLMap from "../../DeckGLMap";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
    component: DeckGLMap,
} as ComponentMeta<typeof DeckGLMap>;

const Template: ComponentStory<typeof DeckGLMap> = (args) => (
    <DeckGLMap {...args} />
);

// Volve kh netmap data, flat surface
export const VolveWells = Template.bind({});
VolveWells.args = {
    id: "volve-wells",
    resources: {
        wellsData: "./volve_wells.json",
    },
    bounds: [432150, 6475800, 439400, 6481500],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
        },
    ],
};
VolveWells.parameters = {
    docs: {
        description: {
            story: "Volve wells example",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const StyledWells = Template.bind({});
StyledWells.args = {
    id: "styled-wells",
    resources: {
        wellsData: "./volve_wells.json",
    },
    bounds: [432150, 6475800, 439400, 6481500],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
            lineStyle: { dash: true },
            refine: false,
            outline: false,
        },
    ],
};
StyledWells.parameters = {
    docs: {
        description: {
            story: "Volve wells example with default dashed well trajectories.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const CustomStyledWells = Template.bind({});
CustomStyledWells.args = {
    id: "custom-styled-wells",
    resources: {
        wellsData: "./volve_wells.json",
    },
    bounds: [432150, 6475800, 439400, 6481500],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
            lineStyle: { color: [255, 0, 0, 255], dash: [10, 3] },
            refine: false,
            outline: false,
        },
    ],
};
CustomStyledWells.parameters = {
    docs: {
        description: {
            story: "Volve wells example with dashed style and red trajectories, with custom style.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

function colorCallback(object: Record<string, Record<string, unknown>>) {
    if ((object["properties"]["name"] as string).match("15/9-19"))
        return object["properties"]["color"];
    else if ((object["properties"]["name"] as string).match("15/9-F"))
        return [0, 0, 0, 0];
    else return [0, 0, 0, 255];
}

function dashCallback(object: Record<string, Record<string, unknown>>) {
    if ((object["properties"]["name"] as string).match("15/9-19"))
        return [1.5, 1.5];
    else return false;
}

export const CallbackStyledWells = Template.bind({});
CallbackStyledWells.args = {
    id: "callback-styled-wells",
    resources: {
        wellsData: "./volve_wells.json",
    },
    bounds: [432150, 6475800, 439400, 6481500],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
            lineStyle: { color: colorCallback, dash: dashCallback },
            refine: false,
            outline: false,
        },
    ],
};
CallbackStyledWells.parameters = {
    docs: {
        description: {
            story: "Volve wells example with trajectory color and dash style supplied as callback.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const HideAllTrajectory = Template.bind({});
HideAllTrajectory.args = {
    id: "trajectory-hidden-wells",
    resources: {
        wellsData: "./volve_wells.json",
        logData:
            "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/volve_logs.json",
    },
    bounds: [432150, 6475800, 439400, 6481500],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
            lineStyle: { color: [0, 0, 0, 0] },
            refine: false,
            outline: false,
            logData: "@@#resources.logData",
            logrunName: "BLOCKING",
            logName: "ZONELOG",
            logColor: "Stratigraphy",
        },
    ],
};
HideAllTrajectory.parameters = {
    docs: {
        description: {
            story: "Volve wells example with all trajectory hidden.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
