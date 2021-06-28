import React from "react";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import TimeAggregationSelector from "./TimeAggregationSelector";

export default {
    component: TimeAggregationSelector,
    title: "WellCompletions/Components/Settings/Time Aggregation Selector",
};

const Template = () => <TimeAggregationSelector />;
export const Selector = Template.bind({});
//Wrap with redux store
Selector.decorators = [withReduxDecorator];
