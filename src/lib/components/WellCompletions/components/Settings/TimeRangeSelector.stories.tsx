import React from "react";
<<<<<<< HEAD
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
=======
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
>>>>>>> Add storybooks for well completions component
import TimeRangeSelector from "./TimeRangeSelector";

export default {
    component: TimeRangeSelector,
    title: "WellCompletions/Components/Settings/Time Range",
};

const Template = () => <TimeRangeSelector />;
export const Selector = Template.bind({});
Selector.decorators = [exampleDataDecorator, withReduxDecorator];
