import React from "react";
<<<<<<< HEAD
import { withReduxDecorator } from "../../test/storybookReduxAddon";
=======
import { withReduxDecorator } from "../../storyUtil/reduxAddon";
>>>>>>> Add storybooks for well completions component
import WellsPerPageSelector from "./WellsPerPageSelector";

export default {
    component: WellsPerPageSelector,
    title: "WellCompletions/Components/Settings/WellsPerPage",
};

const Template = () => <WellsPerPageSelector />;
export const Selector = Template.bind({});
Selector.decorators = [withReduxDecorator];
