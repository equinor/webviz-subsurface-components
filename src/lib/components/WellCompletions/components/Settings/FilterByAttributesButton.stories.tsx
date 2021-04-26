import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import FilterByAttributesButton from "./FilterByAttributesButton";

export default {
    component: FilterByAttributesButton,
    title: "WellCompletions/Components/Settings/Filter by Attributes",
};

const Template = () => <FilterByAttributesButton />;
export const Button = Template.bind({});
Button.decorators = [exampleDataDecorator, withReduxDecorator];
