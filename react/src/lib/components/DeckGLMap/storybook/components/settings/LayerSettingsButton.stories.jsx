import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../../../redux/store";
import LayerSettingsButton from "../../../components/settings/LayerSettingsButton";
import { getLayersWithDefaultProps } from "../../../../DeckGLMap/layers/utils/layerTools";

const exampleData = require("../../../../../../demo/example-data/deckgl-map.json");
const layers = getLayersWithDefaultProps(exampleData[0].layers);
const store = createStore(layers);

export default {
    component: LayerSettingsButton,
    title: "DeckGLMap/Components/Settings/LayerSettingsButton",
    decorators: [(story) => <Provider store={store}> {story()} </Provider>],
};

const Template = (args) => {
    return (
        <LayerSettingsButton
            layerId={args.layerId}
            layerType={args.layerType}
            name={args.name}
            key={`settings-button-${args.layerId}`}
        />
    );
};

export const DrawingSettings = Template.bind({});
DrawingSettings.args = {
    layerId: "drawing-layer",
    layerType: "DrawingLayer",
    name: "Drawing",
};

export const WellsSettings = Template.bind({});
WellsSettings.args = {
    layerId: "wells-layer",
    layerType: "WellsLayer",
    name: "Wells",
};
