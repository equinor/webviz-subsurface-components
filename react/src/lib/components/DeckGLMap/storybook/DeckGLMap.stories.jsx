import React from "react";
import DeckGLMapWrapper from "./DeckGLMapWrapper";

const exampleData = require("../../../../demo/example-data/deckgl-map.json");

export default {
    component: DeckGLMapWrapper,
    title: "DeckGLMapComponent",
};

const Template = (args) => {
    return <DeckGLMapWrapper {...args} />;
};

export const DeckGLMap = Template.bind({});
DeckGLMap.args = exampleData[0];
