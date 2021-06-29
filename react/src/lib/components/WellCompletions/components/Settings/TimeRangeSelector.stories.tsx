import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import TimeRangeSelector from "./TimeRangeSelector";

export default {
    component: TimeRangeSelector,
    title: "WellCompletions/Components/Settings/Time Range",
};

const Template = () => <TimeRangeSelector />;
export const Selector = Template.bind({});
//Wrap with example intpu data and redux store
Selector.decorators = [exampleDataDecorator, withReduxDecorator];
