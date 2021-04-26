import React from "react";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import SortTable from "./SortTable";

export default {
    component: SortTable,
    title: "WellCompletions/Components/Settings/Sort Table",
};

const Template = () => <SortTable />;
export const Table = Template.bind({});
Table.decorators = [withReduxDecorator];
