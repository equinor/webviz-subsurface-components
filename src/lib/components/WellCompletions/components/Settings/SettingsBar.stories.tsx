import React from "react";
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
import SettingsBar from "./SettingsBar";

export default {
    component: SettingsBar,
    title: "WellCompletions/Components",
};

const Template = () => <SettingsBar />;
export const TopBar = Template.bind({});
TopBar.decorators = [exampleDataDecorator, withReduxDecorator];
