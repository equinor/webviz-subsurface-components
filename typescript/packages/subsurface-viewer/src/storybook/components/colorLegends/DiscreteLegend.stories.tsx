import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

// @ts-expect-error TS6192
import type {
    DiscreteCodes,
    colorTablesArray,
} from "@emerson-eps/color-tables";
import { DiscreteColorLegend, colorTables } from "@emerson-eps/color-tables";

const stories: Meta = {
    component: DiscreteColorLegend,
    title: "SubsurfaceViewer/Components/ColorLegends",
};
export default stories;

// @ts-expect-error TS2709
const discreteData: DiscreteCodes = {
    Above_BCU: [[255, 13, 186, 255], 0],
    ABOVE: [[255, 64, 53, 255], 1],
    H12: [[247, 255, 164, 255], 2],
    BELOW: [[73, 255, 35, 255], 14],
    H3: [[255, 144, 1, 255], 11],
};
const colorName = "Stratigraphy";
const dataObjectName = "Wells / ZONELOG";
const horizontal = false;

export const DiscreteColorLegendStory: StoryObj<typeof DiscreteColorLegend> = {
    name: "DiscreteColorLegend",
    args: {
        discreteData,
        dataObjectName,
        colorName,
        // @ts-expect-error TS2709
        colorTables: colorTables as colorTablesArray,
        horizontal,
    },
    render: (args) => <DiscreteColorLegend {...args} />,
};
