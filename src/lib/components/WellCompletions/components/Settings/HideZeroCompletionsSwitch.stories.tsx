import React from "react";
import HideZeroCompletionsSwitch from "./HideZeroCompletionsSwitch";
import { withReduxDecorator } from "../../test/storybookReduxAddon";

export default {
    component: HideZeroCompletionsSwitch,
    title: "WellCompletions/Components/Settings/Hide Zero Completions",
};

const Template = () => <HideZeroCompletionsSwitch />;
export const Switch = Template.bind({});
Switch.decorators = [withReduxDecorator];
