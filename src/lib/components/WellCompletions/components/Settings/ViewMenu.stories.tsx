import React from "react";
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
import ViewMenu from "./ViewMenu";

export default {
    component: ViewMenu,
    title: "WellCompletions/Components/Menus/View",
};

const Template = () => <ViewMenu />;
export const Menu = Template.bind({});
Menu.decorators = [exampleDataDecorator, withReduxDecorator];
