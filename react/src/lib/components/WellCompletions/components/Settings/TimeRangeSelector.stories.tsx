import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import TimeRangeSelector from "./TimeRangeSelector";

export default {
    component: TimeRangeSelector,
    title: "WellCompletions/Components/Settings/Time Range",
    decorators: [exampleDataDecorator, withReduxDecorator],
};
