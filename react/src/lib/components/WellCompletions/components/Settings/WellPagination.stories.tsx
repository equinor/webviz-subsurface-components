import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import WellPagination from "./WellPagination";

export default {
    component: WellPagination,
    title: "WellCompletions/Components/Settings/Well Pagination",
};

const Template = () => <WellPagination />;
export const Bar = Template.bind({});
//Wrap with example intpu data and redux store
Bar.decorators = [exampleDataDecorator, withReduxDecorator];
