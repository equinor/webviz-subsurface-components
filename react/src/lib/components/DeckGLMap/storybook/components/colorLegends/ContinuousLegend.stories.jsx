import React from "react";
import ContinuousLegend from "../../../components/ContinuousLegend";
export default {
    component: ContinuousLegend,
    title: "DeckGLMap/Components/ColorLegends",
};

const min = 0;
const max = 0.35;
const dataObjectName = "Wells / PORO";
const position = [16, 10];
const colorTableColors = [
    [0, 1, 0, 0],
    [0.2, 0.71, 0.71, 0],
    [0.4, 0, 1, 0],
    [0.6, 0, 0.71, 0.71],
    [0.8, 0, 0, 1],
    [1, 0.71, 0, 0.71],
];

const Template = (args) => {
    return <ContinuousLegend {...args} />;
};

export const ContinuousTemplate = Template.bind({});
ContinuousTemplate.args = {
    min,
    max,
    dataObjectName,
    position,
    colorTableColors,
};
