import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import SortButton from "./SortButton";

export default {
    component: SortButton,
    title: "WellCompletions/Components/Buttons/Sort by Attributes",
};

const Template = () => <SortButton />;
export const Button = Template.bind({});
//Wrap with example intpu data and redux store
Button.decorators = [exampleDataDecorator, withReduxDecorator];
