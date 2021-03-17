import React from "react";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
import SortTable from "./SortTable";

export default {
    component: SortTable,
    title: "WellCompletions/Components/Settings/Sort",
};

const Template = () => <SortTable />;
export const Table = Template.bind({});
Table.decorators = [withReduxDecorator];
