import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { format } from "d3-format";
import { PickInfo } from "deck.gl";
import DeckGLMap from "./DeckGLMap";
import { WellsPickInfo } from "./layers/wells/wellsLayer";

export default {
    component: DeckGLMap,
    title: "DeckGLMap",
} as ComponentMeta<typeof DeckGLMap>;

const defaultWellsLayer = {
    "@@type": "WellsLayer",
    data: "@@#resources.wellsData",
};

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
    layers: [defaultWellsLayer],
};

const Template: ComponentStory<typeof DeckGLMap> = (args) => (
    <DeckGLMap {...args} />
);

function mdTooltip(info: PickInfo<unknown>) {
    if (!info.picked) return null;
    const value = (info as WellsPickInfo)?.properties?.[0].value;
    if (!value) return null;
    const f = format(".2f");
    const niceValue = f(+value);
    return "MD: " + niceValue;
}

export const TooltipApi = Template.bind({});
TooltipApi.args = {
    ...defaultProps,
    layers: [
        {
            ...defaultWellsLayer,
            lineStyle: { width: 7 },
        },
    ],
    getTooltip: mdTooltip,
    bounds: [433000, 6476000, 439000, 6480000],
};

TooltipApi.parameters = {
    docs: {
        description: {
            story: "Example of overriding the default tooltip, showing measured depth (MD) instead of the default bahaviour, which is to show the well name.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
