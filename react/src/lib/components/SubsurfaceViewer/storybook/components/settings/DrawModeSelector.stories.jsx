import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../../../redux/store";
import DrawModeSelector from "../../../components/settings/DrawModeSelector";
import { getLayersWithDefaultProps } from "../../../../DeckGLMap/layers/utils/layerTools";

const exampleData = require("../../../../../../demo/example-data/deckgl-map.json");
const layers = getLayersWithDefaultProps(exampleData[0].layers);
const store = createStore(layers);

export default {
    component: DrawModeSelector,
    title: "DeckGLMap/Components/Settings/DrawModeSelector",
    decorators: [(story) => <Provider store={store}> {story()} </Provider>],
};

const Template = (args) => {
    return <DrawModeSelector layerId={args.layerId} />;
};

export const Default = Template.bind({});
Default.args = {
    layerId: "drawing-layer",
};
