import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import SortButton from "./SortButton";

export default {
    component: SortButton,
    title: "WellCompletions/Components/Buttons/Sort by Attributes",
    decorators: [exampleDataDecorator, withReduxDecorator],
};
