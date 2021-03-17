import React from "react";
<<<<<<< HEAD
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
=======
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
>>>>>>> Add storybooks for well completions component
import SettingsBar from "./SettingsBar";

export default {
    component: SettingsBar,
    title: "WellCompletions/Components",
};

const Template = () => <SettingsBar />;
export const TopBar = Template.bind({});
TopBar.decorators = [exampleDataDecorator, withReduxDecorator];
