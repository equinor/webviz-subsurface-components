import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import SettingsBar from "./SettingsBar";

export default {
    component: SettingsBar,
    title: "WellCompletions/Components",
};

const Template = () => <SettingsBar />;
export const TopBar = Template.bind({});
TopBar.decorators = [exampleDataDecorator, withReduxDecorator];
