import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import WellAttributesSelector from "./WellAttributesSelector";

export default {
    component: WellAttributesSelector,
    title: "WellCompletions/Components/Settings/Well Attributes Selector",
};

const Template = () => <WellAttributesSelector />;
export const Filter = Template.bind({});
Filter.decorators = [exampleDataDecorator, withReduxDecorator];
