import type { Meta, StoryObj } from "@storybook/react";

import ToggleButton from "../../../components/settings/ToggleButton";

const stories: Meta = {
    component: ToggleButton,
    title: "SubsurfaceViewer/Components/Settings",
};
export default stories;

export const ToggleButtonStory: StoryObj<typeof ToggleButton> = {
    name: " ToggleButton",
    args: {
        label: "test",
    },
};
