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
    bounds: [432150, 6475800, 439400, 6481500] as [number, number, number, number],
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

export const DashedWells = Template.bind({});
DashedWells.args = {
        ...defaultProps,
        layers: [
                {
                        ...defaultProps.layers[0],
            dashed: true,
            refine: false,
            outline: false,
                }
        ],
}
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
        ...defaultProps,
        layers: [
                {
                        ...defaultProps.layers[0],
            dashed: [10, 3],
            refine: false,
            outline: false,
                }
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
        ...defaultProps,
        layers: [
                {
                        ...defaultProps.layers[0],
            dashed: callback,
            refine: false,
            outline: false,
                }
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

export const Wells3d = Template.bind({});
Wells3d.args = {
        ...defaultProps,
    views: {
            layout: [1, 1],
            viewports: [
                    {
                            id: "a",
                        show3D: true
                    }
            ]
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
            dashed: true,
            refine: false,
            outline: false,
                }
        ],
    views: {
            layout: [1, 1],
            viewports: [
                    {
                            id: "a",
                        show3D: true
                    }
            ]
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

