import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import ZoneSelector from "./ZoneSelector";

export default {
    component: ZoneSelector,
    title: "WellCompletions/Components/Settings/Zone",
};

const Template = () => <ZoneSelector />;
export const Selector = Template.bind({});
Selector.decorators = [exampleDataDecorator, withReduxDecorator];
