import React from "react";
<<<<<<< HEAD
<<<<<<< HEAD
import { withReduxDecorator } from "../../test/storybookReduxAddon";
=======
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
>>>>>>> Add storybooks for well completions component
=======
import { withReduxDecorator } from "../../test/storybookReduxAddon";
>>>>>>> added redux tests and setup react component test examples
import SortTable from "./SortTable";

export default {
    component: SortTable,
    title: "WellCompletions/Components/Settings/Sort",
};

const Template = () => <SortTable />;
export const Table = Template.bind({});
Table.decorators = [withReduxDecorator];
