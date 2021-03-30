import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import ViewMenu from "./ViewMenu";

export default {
    component: ViewMenu,
    title: "WellCompletions/Components/Menus/View",
};

const Template = () => <ViewMenu />;
export const Menu = Template.bind({});
Menu.decorators = [exampleDataDecorator, withReduxDecorator];
