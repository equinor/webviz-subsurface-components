import React from "react";
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
import FilterMenu from "./FilterMenu";

export default {
    component: FilterMenu,
    title: "WellCompletions/Components/Menus/Filter",
};

const Template = () => <FilterMenu />;
export const Menu = Template.bind({});
Menu.decorators = [exampleDataDecorator, withReduxDecorator];
