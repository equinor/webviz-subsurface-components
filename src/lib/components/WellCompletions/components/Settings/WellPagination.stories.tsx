import React from "react";
<<<<<<< HEAD
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
=======
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
>>>>>>> Add storybooks for well completions component
import WellPagination from "./WellPagination";

export default {
    component: WellPagination,
    title: "WellCompletions/Components/Settings/WellPagination",
};

const Template = () => <WellPagination />;
export const Bar = Template.bind({});
Bar.decorators = [exampleDataDecorator, withReduxDecorator];
