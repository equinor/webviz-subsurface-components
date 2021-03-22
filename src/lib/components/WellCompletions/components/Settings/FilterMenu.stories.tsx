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
import FilterMenu from "./FilterMenu";

export default {
    component: FilterMenu,
    title: "WellCompletions/Components/Menus/Filter",
};

const Template = () => <FilterMenu />;
export const Menu = Template.bind({});
Menu.decorators = [exampleDataDecorator, withReduxDecorator];
