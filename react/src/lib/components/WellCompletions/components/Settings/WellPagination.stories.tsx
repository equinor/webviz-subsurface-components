import { exampleDataDecorator } from "../../test/storybookDataDecorator";
import { withReduxDecorator } from "../../test/storybookReduxAddon";
import WellPagination from "./WellPagination";

export default {
    component: WellPagination,
    title: "WellCompletions/Components/Settings/Well Pagination",
    decorators: [exampleDataDecorator, withReduxDecorator],
};
