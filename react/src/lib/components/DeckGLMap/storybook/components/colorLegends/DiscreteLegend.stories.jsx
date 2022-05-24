import React from "react";
import { DiscreteColorLegend } from "@emerson-eps/color-tables";
import colorTables from "@emerson-eps/color-tables/dist/component/color-tables.json";

export default {
    component: DiscreteColorLegend,
    title: "DeckGLMap/Components/ColorLegends/DiscreteColorLegend",
};

const discreteData = {
    Above_BCU: [[255, 13, 186, 255], 0],
    ABOVE: [[255, 64, 53, 255], 1],
    H12: [[247, 255, 164, 255], 2],
    BELOW: [[73, 255, 35, 255], 14],
    H3: [[255, 144, 1, 255], 11],
};
const colorName = "Stratigraphy";
const dataObjectName = "Wells / ZONELOG";
const position = [16, 10];
const horizontal = false;

const Template = (args) => {
    return <DiscreteColorLegend {...args} />;
};

export const DiscreteTemplate = Template.bind({});
DiscreteTemplate.args = {
    discreteData,
    dataObjectName,
    position,
    colorName,
    colorTables,
    horizontal,
};
