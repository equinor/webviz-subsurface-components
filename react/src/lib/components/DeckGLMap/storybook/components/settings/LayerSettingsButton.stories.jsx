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
            layerType={args.layerType}
            key={`settings-button-${args.layerId}`}
        />
    );
};

export const Default = Template.bind({});
Default.args = {
    layerId: "drawing-layer",
    layerType: "DrawingLayer",
};
