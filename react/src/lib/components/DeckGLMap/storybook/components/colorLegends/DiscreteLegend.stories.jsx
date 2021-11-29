import React from "react";
import DiscreteColorLegend from "../../../components/DiscreteLegend";

export default {
    component: DiscreteColorLegend,
    title: "DeckGLMap/Components/ColorLegends",
};

const discreteData = {
    Above_BCU: [[255, 13, 186, 255], 0],
    ABOVE: [[255, 64, 53, 255], 1],
    H12: [[247, 255, 164, 255], 2],
    BELOW: [[73, 255, 35, 255], 14],
    H3: [[255, 144, 1, 255], 11],
};
const logName = "ZONELOG";
const dataObjectName = "Wells / ZONELOG";
const position = [16, 10];

const Template = (args) => {
    return <DiscreteColorLegend {...args} />;
};

export const DiscreteTemplate = Template.bind({});
DiscreteTemplate.args = {
    discreteData,
    logName,
    dataObjectName,
    position,
};
