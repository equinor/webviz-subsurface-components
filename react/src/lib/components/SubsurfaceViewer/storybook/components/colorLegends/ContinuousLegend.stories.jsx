import React from "react";
import { ContinuousLegend, colorTables } from "@emerson-eps/color-tables";
export default {
    component: ContinuousLegend,
    title: "SubsurfaceViewer/Components/ColorLegends/ContinuousLegend",
};

const min = 0;
const max = 0.35;
const dataObjectName = "Wells / PORO";
const position = [16, 10];
const name = "PORO";
const horizontal = false;
const colorName = "Rainbow";
const reverseRange = false;

const Template = (args) => {
    return <ContinuousLegend {...args} />;
};

export const ContinuousTemplate = Template.bind({});
ContinuousTemplate.args = {
    min,
    max,
    dataObjectName,
    position,
    name,
    colorName,
    colorTables,
    horizontal,
    reverseRange,
};
