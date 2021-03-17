import React from "react";
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
import TimeRangeSelector from "./TimeRangeSelector";

export default {
    component: TimeRangeSelector,
    title: "WellCompletions/Components/Settings/Time Range",
};

const Template = () => <TimeRangeSelector />;
export const Selector = Template.bind({});
Selector.decorators = [exampleDataDecorator, withReduxDecorator];
