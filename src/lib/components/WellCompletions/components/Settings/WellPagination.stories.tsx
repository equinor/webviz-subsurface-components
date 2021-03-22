import React from "react";
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import WellPagination from "./WellPagination";

export default {
    component: WellPagination,
    title: "WellCompletions/Components/Settings/WellPagination",
};

const Template = () => <WellPagination />;
export const Bar = Template.bind({});
Bar.decorators = [exampleDataDecorator, withReduxDecorator];
