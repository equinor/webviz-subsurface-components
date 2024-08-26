import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

// @ts-expect-error TS6133
import type { colorTablesArray } from "@emerson-eps/color-tables";
import { ContinuousLegend, colorTables } from "@emerson-eps/color-tables";

const stories: Meta = {
    component: ContinuousLegend,
    title: "SubsurfaceViewer/Components/ColorLegends",
};
export default stories;

const min = 0;
const max = 0.35;
const dataObjectName = "Wells / PORO";
const name = "PORO";
const horizontal = false;
const colorName = "Rainbow";
const reverseRange = false;

export const ContinuousLegendStory: StoryObj<typeof ContinuousLegend> = {
    name: "ContinuousLegend",
    args: {
        min,
        max,
        dataObjectName,
        id: name,
        colorName,
        // @ts-expect-error TS2709
        colorTables: colorTables as colorTablesArray,
        horizontal,
        reverseRange,
    },
    render: (args) => <ContinuousLegend {...args} />,
};
