import React from "react";
<<<<<<< HEAD
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
=======
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
>>>>>>> Add storybooks for well completions component
import WellFilter from "./WellFilter";

export default {
    component: WellFilter,
    title: "WellCompletions/Components/Settings/Well",
};

const Template = () => <WellFilter />;
export const Filter = Template.bind({});
Filter.decorators = [exampleDataDecorator, withReduxDecorator];
