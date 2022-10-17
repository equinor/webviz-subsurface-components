import React from "react";
import DeckGL from "@deck.gl/react/typed";
import { rgb } from "d3-color";
import { Color, OrthographicView } from "@deck.gl/core/typed";

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

function ColoredLabels(props: { labelColor: string; axisColor: string }) {
    const layers = [
        new AxesLayer({
            ...layerProps,
            labelColor: getRgba(props.labelColor) as Color,
            axisColor: getRgba(props.axisColor) as Color,
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
    axisColor: "white",
};

DarkMode.parameters = {
    backgrounds: { default: "dark" },
};

export const CustomLabel: ComponentStory<typeof CustomLabels> = (args) => {
    return <CustomLabels {...args} />;
};

function CustomLabels(props: {
    labelColor: string;
    labelFontSize: number;
    fontFamily: string;
}) {
    const layers = [
        new AxesLayer({
            ...layerProps,
            labelColor: getRgba(props.labelColor) as Color,
            labelFontSize: props.labelFontSize,
            fontFamily: props.fontFamily,
        }),
    ];
    const views = [new OrthographicView({})];
    return <DeckGL layers={layers} views={views} />;
}

CustomLabel.args = {
    labelColor: "blue",
    labelFontSize: 10,
    fontFamily: "math",
};
