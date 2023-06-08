import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import SettingsBar from "./SettingsBar";

export default {
    component: SettingsBar,
    title: "WellCompletions/Components",
    decorators: [exampleDataDecorator, withReduxDecorator],
};
