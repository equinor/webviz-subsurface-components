import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import DistanceScale from "./DistanceScale";

export default {
    component: DistanceScale,
    title: "DeckGLMap / Components / DistanceScale",
} as ComponentMeta<typeof DistanceScale>;

const Template: ComponentStory<typeof DistanceScale> = (args) => (
    <DistanceScale {...args} />
);

export const Baseline = Template.bind({});
