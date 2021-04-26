import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import FilterMenu from "./FilterMenu";

export default {
    component: FilterMenu,
    title: "WellCompletions/Components/Menus/Filter",
};

const Template = () => <FilterMenu />;
export const Menu = Template.bind({});
Menu.decorators = [exampleDataDecorator, withReduxDecorator];
