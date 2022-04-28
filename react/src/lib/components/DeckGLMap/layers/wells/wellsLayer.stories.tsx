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

export const DashedWells = Template.bind({});
DashedWells.args = {
    id: "dashed-wells",
    resources: {
        wellsData: "./volve_wells.json",
    },
    bounds: [432150, 6475800, 439400, 6481500],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
            dashed: true,
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

export const CustomDashedWells = Template.bind({});
CustomDashedWells.args = {
    id: "custom-dashed-wells",
    resources: {
        wellsData: "./volve_wells.json",
    },
    bounds: [432150, 6475800, 439400, 6481500],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
            dashed: [10, 3],
            refine: false,
            outline: false,
        },
    ],
};
CustomDashedWells.parameters = {
    docs: {
        description: {
            story: "Volve wells example with dashed well trajectories, with custom style.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

function callback(object: Record<string, Record<string, unknown>>) {
    if (object["properties"]["name"] == "15/9-F-11 B") return [5, 3];
    return [0, 0];
}

export const CallbackDashedWells = Template.bind({});
CallbackDashedWells.args = {
    id: "callback-dashed-wells",
    resources: {
        wellsData: "./volve_wells.json",
    },
    bounds: [432150, 6475800, 439400, 6481500],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
            dashed: callback,
            refine: false,
            outline: false,
        },
    ],
};
CallbackDashedWells.parameters = {
    docs: {
        description: {
            story: "Volve wells example with dashed well trajectories, with custom style.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
