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
            style: { dash: true },
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
            style: { color: [255, 0, 0, 255], dash: [10, 3] },
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

function callback(object: Record<string, Record<string, unknown>>) {
    if (object["properties"]["name"] == "15/9-F-11 B")
        return { color: [255, 0, 0, 255], dash: true };
    else if (object["properties"]["name"] == "15/9-F-14")
        return { dash: [10, 1] };
    else if (object["properties"]["name"] == "15/9-F-10")
        return { color: [0, 0, 0, 0] };
    return {};
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
            style: callback,
            refine: false,
            outline: false,
        },
    ],
};
CallbackStyledWells.parameters = {
    docs: {
        description: {
            story: "Volve wells example with dashed and colored trajectories, with custom style.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
