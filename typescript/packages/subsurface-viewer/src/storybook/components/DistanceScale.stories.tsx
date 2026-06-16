import type { Meta, StoryObj } from "@storybook/react-webpack5";

import { DistanceScale } from "../../components/DistanceScale";

const stories: Meta = {
    component: DistanceScale,
    title: "SubsurfaceViewer / Components / DistanceScale",
};
export default stories;

const darkModeStyle = {
    color: "white",
};

export const LightMode: StoryObj<typeof DistanceScale> = {};

export const DarkMode: StoryObj<typeof DistanceScale> = {
    args: {
        style: darkModeStyle,
    },
    globals: {
        backgrounds: { value: "dark" },
    },
};
