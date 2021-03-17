import React from "react";
<<<<<<< HEAD
import { withReduxDecorator } from "../../test/storybookReduxAddon";
=======
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
>>>>>>> Add storybooks for well completions component
import SortTable from "./SortTable";

export default {
    component: SortTable,
    title: "WellCompletions/Components/Settings/Sort",
};

const Template = () => <SortTable />;
export const Table = Template.bind({});
Table.decorators = [withReduxDecorator];
