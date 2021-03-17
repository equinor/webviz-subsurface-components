import React from "react";
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
import WellFilter from "./WellFilter";

export default {
    component: WellFilter,
    title: "WellCompletions/Components/Settings/Well",
};

const Template = () => <WellFilter />;
export const Filter = Template.bind({});
Filter.decorators = [exampleDataDecorator, withReduxDecorator];
