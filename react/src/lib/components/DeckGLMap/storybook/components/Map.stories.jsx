import React from "react";
import MapWrapper from "./MapWrapper";

const exampleData = require("../../../../../demo/example-data/deckgl-map-spec.json");
export default {
    component: MapWrapper,
    title: "DeckGLMapComponent/Components/Map",
};

const Template = (args) => {
    return <MapWrapper {...args} />;
};

export const Default = Template.bind({});
Default.args = exampleData[0];
