import React from "react";
<<<<<<< HEAD
import { withReduxDecorator } from "../../test/storybookReduxAddon";
=======
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
>>>>>>> Add storybooks for well completions component
import RangeDisplayModeSelector from "./RangeDisplayModeSelector";

export default {
    component: RangeDisplayModeSelector,
    title: "WellCompletions/Components/Settings/Range Display Mode",
};

const Template = () => <RangeDisplayModeSelector />;
export const Selector = Template.bind({});
Selector.decorators = [withReduxDecorator];
