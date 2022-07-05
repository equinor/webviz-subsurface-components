import React from "react";
import DeckGL from "@deck.gl/react";
import {OrthographicView} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import {rgb} from "d3-color";

import { ComponentStory, ComponentMeta } from "@storybook/react";
import AxesLayer from "./axesLayer";

export default {
    component: DeckGL,
    title: "DeckGLMap / Axes",

} as ComponentMeta<typeof DeckGL>;

const layerProps = {
	name: "axes",
        bounds: [-100, -100, 0, 100, 100, 100] as [number, number, number, number, number, number],
};

function getRgba(color: string) {
	const c = rgb(color);
	return [c.r, c.g, c.b, c.opacity * 255];
}

export const Baseline: ComponentStory<typeof DeckGL> = (args) => {
	args.layers = [new AxesLayer({...layerProps})];
	args.views = new OrthographicView();
        return <DeckGL {...args} />;
}

export const DarkMode: ComponentStory<typeof DeckGL> = (args) => {
	args.layers = [new AxesLayer({
		...layerProps,
		labelColor: getRgba(args.labelColor),
		})];
	args.views = new OrthographicView();
        return <DeckGL {...args} />;
}

DarkMode.args = {
	labelColor: "white",
}

DarkMode.parameters = {
	backgrounds: {default: "dark",},
}
