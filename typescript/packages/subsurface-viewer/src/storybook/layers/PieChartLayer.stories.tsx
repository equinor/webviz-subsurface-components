import type { Meta, StoryObj } from "@storybook/react-webpack5";

import pieData from "../../../../../../example-data/piechart.json";
import SubsurfaceViewer from "../../SubsurfaceViewer";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Pie Chart Layer",
    tags: ["no-dom-test"],
};
export default stories;

const minX = Math.min(...pieData.pies.map((pie) => pie.x));
const minY = Math.min(...pieData.pies.map((pie) => pie.y));
const maxX = Math.max(...pieData.pies.map((pie) => pie.x));
const maxY = Math.max(...pieData.pies.map((pie) => pie.y));
const padding = Math.max(maxX - minX, maxY - minY) * 0.1;

export const ExampleData: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "pie-chart-example",
        bounds: [
            minX - padding,
            minY - padding,
            maxX + padding,
            maxY + padding,
        ],
        layers: [
            {
                "@@type": "PieChartLayer",
                data: pieData,
            },
        ],
    },
};
