import React from "react";
<<<<<<< HEAD
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
=======
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
>>>>>>> Add storybooks for well completions component
import ViewMenu from "./ViewMenu";

export default {
    component: ViewMenu,
    title: "WellCompletions/Components/Menus/View",
};

const Template = () => <ViewMenu />;
export const Menu = Template.bind({});
Menu.decorators = [exampleDataDecorator, withReduxDecorator];
