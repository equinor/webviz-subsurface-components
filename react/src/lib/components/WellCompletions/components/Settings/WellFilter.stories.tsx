import React from "react";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import WellFilter from "./WellFilter";

export default {
    component: WellFilter,
    title: "WellCompletions/Components/Settings/Well Filter",
};

const Template = () => <WellFilter />;
export const Filter = Template.bind({});
//Wrap with redux store
Filter.decorators = [withReduxDecorator];
