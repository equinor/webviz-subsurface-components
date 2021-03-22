import React from "react";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import RangeDisplayModeSelector from "./RangeDisplayModeSelector";

export default {
    component: RangeDisplayModeSelector,
    title: "WellCompletions/Components/Settings/Range Display Mode",
};

const Template = () => <RangeDisplayModeSelector />;
export const Selector = Template.bind({});
Selector.decorators = [withReduxDecorator];
