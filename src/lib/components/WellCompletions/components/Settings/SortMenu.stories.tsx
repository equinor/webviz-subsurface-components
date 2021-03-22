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
import SortMenu from "./SortMenu";

export default {
    component: SortMenu,
    title: "WellCompletions/Components/Menus/Sort",
};

const Template = () => <SortMenu />;
export const Menu = Template.bind({});
Menu.decorators = [exampleDataDecorator, withReduxDecorator];
