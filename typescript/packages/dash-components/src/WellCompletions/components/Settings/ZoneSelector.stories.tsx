import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import ZoneSelector from "./ZoneSelector";

export default {
    component: ZoneSelector,
    title: "WellCompletions/Components/Settings/Zone Selector",
    decorators: [exampleDataDecorator, withReduxDecorator],
};
