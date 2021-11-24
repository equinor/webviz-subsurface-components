import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../../../redux/store";
import LayersButton from "../../../components/settings/LayersButton";
import { getLayersWithDefaultProps } from "../../../../DeckGLMap/layers/utils/layerTools";

const exampleData = require("../../../../../../demo/example-data/deckgl-map.json");
const layers = getLayersWithDefaultProps(exampleData[0].layers);
const store = createStore(layers);

export default {
    component: LayersButton,
    title: "DeckGLMap/Components/Settings/LayersButton",
    decorators: [(story) => <Provider store={store}> {story()} </Provider>],
};

const Template = () => {
    return <LayersButton />;
};

export const Default = Template.bind({});
