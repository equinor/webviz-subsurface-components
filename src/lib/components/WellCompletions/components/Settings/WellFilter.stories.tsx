import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import WellFilter from "./WellFilter";

export default {
    component: WellFilter,
    title: "WellCompletions/Components/Settings/Well",
};

const Template = () => <WellFilter />;
export const Filter = Template.bind({});
Filter.decorators = [exampleDataDecorator, withReduxDecorator];
