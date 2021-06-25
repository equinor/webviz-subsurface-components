import React from "react";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import HideZeroCompletionsSwitch from "./HideZeroCompletionsSwitch";
export default {
    component: HideZeroCompletionsSwitch,
    title: "WellCompletions/Components/Settings/Hide Zero Completions",
};

const Template = () => <HideZeroCompletionsSwitch />;
export const Switch = Template.bind({});
//Wrap with redux store
Switch.decorators = [withReduxDecorator];
