import React from "react";
import HideZeroCompletionsSwitch from "./HideZeroCompletionsSwitch";
<<<<<<< HEAD
<<<<<<< HEAD
import { withReduxDecorator } from "../../test/storybookReduxAddon";
=======
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
>>>>>>> Add storybooks for well completions component
=======
import { withReduxDecorator } from "../../test/storybookReduxAddon";
>>>>>>> added redux tests and setup react component test examples

export default {
    component: HideZeroCompletionsSwitch,
    title: "WellCompletions/Components/Settings/Hide Zero Completions",
};

const Template = () => <HideZeroCompletionsSwitch />;
export const Switch = Template.bind({});
Switch.decorators = [withReduxDecorator];
