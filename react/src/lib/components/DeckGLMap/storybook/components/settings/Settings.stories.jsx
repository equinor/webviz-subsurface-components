import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../../../redux/store";
import Settings from "../../../components/settings/Settings";
import { getLayersWithDefaultProps } from "../../../../DeckGLMap/layers/utils/layerTools";

const exampleData = require("../../../../../../demo/example-data/deckgl-map.json");
const layers = getLayersWithDefaultProps(exampleData[0].layers);
const store = createStore({ layers: layers });

export default {
    component: Settings,
    title: "DeckGLMap/Components/Settings",
    decorators: [(story) => <Provider store={store}> {story()} </Provider>],
};

const Template = () => {
    return <Settings />;
};

export const Default = Template.bind({});
