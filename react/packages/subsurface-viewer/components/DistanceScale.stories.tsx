import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import DistanceScale from "./DistanceScale";

export default {
    component: DistanceScale,
    title: "SubsurfaceViewer / Components / DistanceScale",
} as ComponentMeta<typeof DistanceScale>;

const darkModeStyle = {
    color: "white",
};

const Template: ComponentStory<typeof DistanceScale> = (args) => (
    <DistanceScale {...args} />
);

export const Baseline = Template.bind({});

export const DarkMode = Template.bind({});

DarkMode.args = {
    style: darkModeStyle,
};

DarkMode.parameters = {
    backgrounds: { default: "dark" },
};
