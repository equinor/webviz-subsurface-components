import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import WellAttributesSelector from "./WellAttributesSelector";

export default {
    component: WellAttributesSelector,
    title: "WellCompletions/Components/Settings/Well Attributes Selector",
    decorators: [exampleDataDecorator, withReduxDecorator],
};
