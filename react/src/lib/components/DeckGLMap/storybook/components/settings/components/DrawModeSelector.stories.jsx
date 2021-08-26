import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../../../../redux/store";
import DrawModeSelector from "../../../../components/settings/DrawModeSelector";

const exampleData = require("../../../../../../../demo/example-data/deckgl-map.json");
const store = createStore(exampleData[0].deckglSpecBase, (patch) => patch);

export default {
    component: DrawModeSelector,
    title: "DeckGLMapComponent/Components/Settings/Components/DrawModeSelector",
    decorators: [(story) => <Provider store={store}> {story()} </Provider>],
};

const Template = (args) => {
    return <DrawModeSelector layerId={args.layerId} />;
};

export const DrawMode = Template.bind({});
DrawMode.args = {
    layerId: "drawing-layer",
};
