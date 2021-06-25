import React from "react";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import FilterButton from "./FilterButton";

export default {
    component: FilterButton,
    title: "WellCompletions/Components/Buttons/Filter",
};

const Template = () => <FilterButton />;
export const Button = Template.bind({});
//Wrap with redux store
Button.decorators = [withReduxDecorator];
