import type { Meta, StoryObj } from "@storybook/react";

import NumericInput from "../../../components/settings/NumericInput";

const stories: Meta = {
    component: NumericInput,
    title: "SubsurfaceViewer/Components/Settings",
};
export default stories;

export const NumericInputStory: StoryObj<typeof NumericInput> = {
    name: "NumericInput",
    args: {
        label: "test",
        value: 5,
    },
};
