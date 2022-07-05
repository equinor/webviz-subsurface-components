import React from "react";
import DeckGL from "@deck.gl/react";
import { OrthographicView } from "@deck.gl/core";
import { rgb } from "d3-color";
import { RGBAColor } from "@deck.gl/core/utils/color";

import { ComponentStory, ComponentMeta } from "@storybook/react";
import AxesLayer from "./axesLayer";

export default {
    component: DeckGL,
    title: "DeckGLMap / Axes",
} as ComponentMeta<typeof DeckGL>;

const layerProps = {
    name: "axes",
    bounds: [-100, -100, 0, 100, 100, 100] as [
        number,
        number,
        number,
        number,
        number,
        number
    ],
};

function getRgba(color: string) {
    const c = rgb(color);
    return [c.r, c.g, c.b, c.opacity * 255];
}

export const Baseline: ComponentStory<typeof DeckGL> = (args) => {
    args.layers = [new AxesLayer({ ...layerProps })];
    args.views = [new OrthographicView({})];
    return <DeckGL {...args} />;
};

function ColoredLabels(props: { labelColor: string }) {
    const layers = [
        new AxesLayer({
            ...layerProps,
            labelColor: getRgba(props.labelColor) as RGBAColor,
        }),
    ];
    const views = [new OrthographicView({})];
    return <DeckGL layers={layers} views={views} />;
}

export const DarkMode: ComponentStory<typeof ColoredLabels> = (args) => {
    return <ColoredLabels {...args} />;
};

DarkMode.args = {
    labelColor: "white",
};

DarkMode.parameters = {
    backgrounds: { default: "dark" },
};
