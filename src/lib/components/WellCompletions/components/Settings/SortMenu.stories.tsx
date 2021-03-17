import React from "react";
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
import SortMenu from "./SortMenu";

export default {
    component: SortMenu,
    title: "WellCompletions/Components/Menus/Sort",
};

const Template = () => <SortMenu />;
export const Menu = Template.bind({});
Menu.decorators = [exampleDataDecorator, withReduxDecorator];
