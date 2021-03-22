import React from "react";
<<<<<<< HEAD
<<<<<<< HEAD
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
=======
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
>>>>>>> Add storybooks for well completions component
=======
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
>>>>>>> added redux tests and setup react component test examples
import ViewMenu from "./ViewMenu";

export default {
    component: ViewMenu,
    title: "WellCompletions/Components/Menus/View",
};

const Template = () => <ViewMenu />;
export const Menu = Template.bind({});
Menu.decorators = [exampleDataDecorator, withReduxDecorator];
