import React from "react";
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
import WellPagination from "./WellPagination";

export default {
    component: WellPagination,
    title: "WellCompletions/Components/Settings/WellPagination",
};

const Template = () => <WellPagination />;
export const Bar = Template.bind({});
Bar.decorators = [exampleDataDecorator, withReduxDecorator];
