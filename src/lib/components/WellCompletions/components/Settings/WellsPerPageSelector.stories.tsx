import React from "react";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import WellsPerPageSelector from "./WellsPerPageSelector";

export default {
    component: WellsPerPageSelector,
    title: "WellCompletions/Components/Settings/WellsPerPage",
};

const Template = () => <WellsPerPageSelector />;
export const Selector = Template.bind({});
Selector.decorators = [withReduxDecorator];
