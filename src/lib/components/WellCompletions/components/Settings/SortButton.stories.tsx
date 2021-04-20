import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import SortButton from "./SortButton";

export default {
    component: SortButton,
    title: "WellCompletions/Components/Settings/Sort",
};

const Template = () => <SortButton />;
export const Button = Template.bind({});
Button.decorators = [exampleDataDecorator, withReduxDecorator];
