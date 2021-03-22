import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import SortMenu from "./SortMenu";

export default {
    component: SortMenu,
    title: "WellCompletions/Components/Menus/Sort",
};

const Template = () => <SortMenu />;
export const Menu = Template.bind({});
Menu.decorators = [exampleDataDecorator, withReduxDecorator];
