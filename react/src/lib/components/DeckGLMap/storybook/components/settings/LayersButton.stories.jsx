import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../../../redux/store";
import LayersButton from "../../../components/settings/LayersButton";

const exampleData = require("../../../../../../demo/example-data/deckgl-map.json");
const store = createStore(exampleData[0].deckglSpecBase, (patch) => patch);

export default {
    component: LayersButton,
    title: "DeckGLMap/Components/Settings/LayersButton",
    decorators: [(story) => <Provider store={store}> {story()} </Provider>],
};

const Template = () => {
    return <LayersButton />;
};

export const Default = Template.bind({});
