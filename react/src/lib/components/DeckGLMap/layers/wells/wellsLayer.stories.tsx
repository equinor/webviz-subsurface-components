import React from "react";
import DeckGLMap from "../../DeckGLMap";
import { ComponentStory, ComponentMeta } from "@storybook/react";

export default {
    component: DeckGLMap,
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

// Volve kh netmap data, flat surface
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

export const StyledWells = Template.bind({});
StyledWells.args = {
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
    ...defaultProps,
    layers: [
        {
            ...defaultProps.layers[0],
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
HideAllTrajectory.parameters = {
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
