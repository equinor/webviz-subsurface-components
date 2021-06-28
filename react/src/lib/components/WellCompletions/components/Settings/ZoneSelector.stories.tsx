import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import ZoneSelector from "./ZoneSelector";

export default {
    component: ZoneSelector,
    title: "WellCompletions/Components/Settings/Zone Selector",
};

const Template = () => <ZoneSelector />;
export const Selector = Template.bind({});
//Wrap with example intpu data and redux store
Selector.decorators = [exampleDataDecorator, withReduxDecorator];
