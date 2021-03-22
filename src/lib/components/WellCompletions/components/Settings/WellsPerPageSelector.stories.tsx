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
import WellsPerPageSelector from "./WellsPerPageSelector";

export default {
    component: WellsPerPageSelector,
    title: "WellCompletions/Components/Settings/WellsPerPage",
};

const Template = () => <WellsPerPageSelector />;
export const Selector = Template.bind({});
Selector.decorators = [withReduxDecorator];
