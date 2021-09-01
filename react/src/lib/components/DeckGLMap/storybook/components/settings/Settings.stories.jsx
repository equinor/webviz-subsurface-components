import React from "react";
import { Provider } from "react-redux";
import { createStore } from "../../../redux/store";
import Settings from "../../../components/settings/Settings";

const exampleData = require("../../../../../../demo/example-data/deckgl-map.json");
const store = createStore(exampleData[0].deckglSpecBase, (patch) => patch);

export default {
    component: Settings,
    title: "DeckGLMap/Components/Settings",
    decorators: [(story) => <Provider store={store}> {story()} </Provider>],
};

const Template = () => {
    return <Settings />;
};

export const Default = Template.bind({});
