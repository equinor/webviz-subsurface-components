import React from "react";
import Map from "../../components/Map";
import template from "../../../../../demo/example-data/welllayer_template.json";
import colorTables from "../../../../../demo/example-data/color-tables.json";

const exampleData = require("../../../../../demo/example-data/deckgl-map.json");
export default {
    component: Map,
    title: "DeckGLMap/Components/Map",
};

const Template = (args) => {
    return <Map {...args} />;
};

export const Default = Template.bind({});
Default.args = {
    ...exampleData[0],
    template: template,
    colorTables: colorTables,
};
