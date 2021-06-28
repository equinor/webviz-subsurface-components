import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import ViewButton from "./ViewButton";

export default {
    component: ViewButton,
    title: "WellCompletions/Components/Buttons/View",
};

const Template = () => <ViewButton />;
export const Menu = Template.bind({});
//Wrap with example intpu data and redux store
Menu.decorators = [exampleDataDecorator, withReduxDecorator];
