import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { rgb } from "d3-color";

import type { Color } from "@deck.gl/core";
import { OrthographicView } from "@deck.gl/core";
import DeckGL from "@deck.gl/react";

import AxesLayer from "../../layers/axes/axesLayer";

const stories: Meta = {
    component: DeckGL,
    title: "SubsurfaceViewer / AxesLayer",
};
export default stories;

const layerProps = {
    name: "axes",
    bounds: [-100, -100, 0, 100, 100, 100] as [
        number,
        number,
        number,
        number,
        number,
        number,
    ],
};

function getRgba(color: string) {
    const c = rgb(color);
    return [c.r, c.g, c.b, c.opacity * 255];
}

export const LightMode: StoryObj<typeof DeckGL> = {
    render: () => (
        <DeckGL
            layers={[new AxesLayer({ ...layerProps })]}
            views={[new OrthographicView({})]}
        />
    ),
};

type ColoredLabelsComponentProps = {
    labelColor: string;
    axisColor: string;
};

const ColoredLabelsComponent: React.FC<ColoredLabelsComponentProps> = (
    props: ColoredLabelsComponentProps
) => {
    const layers = [
        new AxesLayer({
            ...layerProps,
            labelColor: getRgba(props.labelColor) as Color,
            axisColor: getRgba(props.axisColor) as Color,
        }),
    ];
    const views = [new OrthographicView({})];
    return <DeckGL layers={layers} views={views} />;
};

export const DarkMode: StoryObj<typeof ColoredLabelsComponent> = {
    args: {
        labelColor: "white",
        axisColor: "white",
    },
    parameters: {
        backgrounds: { default: "dark" },
    },
    render: (args) => <ColoredLabelsComponent {...args} />,
};

type CustomLabelsComponentProps = {
    labelColor: string;
    labelFontSize: number;
    fontFamily: string;
};

const CustomLabelsComponent: React.FC<CustomLabelsComponentProps> = (
    props: CustomLabelsComponentProps
) => {
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
};

export const CustomLabel: StoryObj<typeof CustomLabelsComponent> = {
    args: {
        labelColor: "blue",
        labelFontSize: 10,
        fontFamily: "math",
    },
    render: (args) => <CustomLabelsComponent {...args} />,
};
