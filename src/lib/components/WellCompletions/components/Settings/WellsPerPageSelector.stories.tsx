import React from "react";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import WellsPerPageSelector from "./WellsPerPageSelector";

export default {
    component: WellsPerPageSelector,
    title: "WellCompletions/Components/Settings/Wells Per Page",
};

const Template = () => <WellsPerPageSelector />;
export const Selector = Template.bind({});
//Wrap with redux store
Selector.decorators = [withReduxDecorator];
