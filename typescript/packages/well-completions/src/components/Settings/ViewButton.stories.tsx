import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import ViewButton from "./ViewButton";

export default {
    component: ViewButton,
    title: "WellCompletions/Components/Buttons/View",
    decorators: [exampleDataDecorator, withReduxDecorator],
};
