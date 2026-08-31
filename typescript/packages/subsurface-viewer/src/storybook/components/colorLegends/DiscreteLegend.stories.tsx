// eslint-disable-next-line @typescript-eslint/no-unused-vars

import type { Meta, StoryObj } from "@storybook/react-webpack5";

import type { DiscreteCodes } from "@emerson-eps/color-tables";
import { DiscreteColorLegend, colorTables } from "@emerson-eps/color-tables";

const stories: Meta = {
    component: DiscreteColorLegend,
    title: "SubsurfaceViewer/Components/ColorLegends",
    tags: ["no-dom-test"],
};
export default stories;

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
        colorTables: colorTables,
        horizontal,
    },
    render: (args) => <DiscreteColorLegend {...args} />,
};
