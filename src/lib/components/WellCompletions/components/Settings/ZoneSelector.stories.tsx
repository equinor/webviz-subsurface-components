import React from "react";
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
import ZoneSelector from "./ZoneSelector";

export default {
    component: ZoneSelector,
    title: "WellCompletions/Components/Settings/Zone",
};

const Template = () => <ZoneSelector />;
export const Selector = Template.bind({});
Selector.decorators = [exampleDataDecorator, withReduxDecorator];
