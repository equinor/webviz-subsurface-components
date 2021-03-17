import React from "react";
<<<<<<< HEAD
import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
=======
import { exampleDataDecorator } from "../../storyUtil/inputDataDecorator";
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
>>>>>>> Add storybooks for well completions component
import ZoneSelector from "./ZoneSelector";

export default {
    component: ZoneSelector,
    title: "WellCompletions/Components/Settings/Zone",
};

const Template = () => <ZoneSelector />;
export const Selector = Template.bind({});
Selector.decorators = [exampleDataDecorator, withReduxDecorator];
