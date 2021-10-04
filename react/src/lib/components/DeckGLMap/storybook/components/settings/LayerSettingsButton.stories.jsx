import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../../../redux/store";
import LayerSettingsButton from "../../../components/settings/LayerSettingsButton";

const exampleData = require("../../../../../../demo/example-data/deckgl-map.json");
const store = createStore(exampleData[0].deckglSpecBase, (patch) => patch);

export default {
    component: LayerSettingsButton,
    title: "DeckGLMap/Components/Settings/LayerSettingsButton",
    decorators: [(story) => <Provider store={store}> {story()} </Provider>],
};

const Template = (args) => {
    return (
        <LayerSettingsButton
            layerId={args.layerId}
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
