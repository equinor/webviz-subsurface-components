import React from "react";
// import { withReduxDecorator } from "../../test/storybookReduxAddon";
import WellFilter from "./WellFilter";

export default {
    component: WellFilter,
    title: "WellCompletions/Components/Settings/Well Filter",
};

const Template = () => <WellFilter />;
export const Filter = Template.bind({});
// TODO: Is this needed? It doesn't typecheck.
//Wrap with redux store
// Filter.decorators = [withReduxDecorator];
