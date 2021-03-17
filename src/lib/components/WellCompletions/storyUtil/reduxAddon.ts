import addons from "@storybook/addons";
import withRedux from "addon-redux/withRedux";
import { Provider } from "react-redux";
import { createReduxStore } from "../redux/store";
import { UISettings } from "../redux/types";
import {
    SORT_BY_COMPLETION_DATE,
    SORT_BY_NAME,
    SORT_BY_STRATIGRAPHY_DEPTH,
} from "../utils/sort";

const state = {
    id: "test",
    ui: {
        timeIndexRange: [0, 9],
        wellsPerPage: 25,
        currentPage: 1,
        rangeDisplayMode: "First Step",
        wellSearchText: "",
        filteredZones: [],
        hideZeroCompletions: false,
        sortBy: {},
    } as UISettings,
    attributes: {
        attributeKeys: [
            SORT_BY_NAME,
            SORT_BY_STRATIGRAPHY_DEPTH,
            SORT_BY_COMPLETION_DATE,
            "type",
            "region",
            "user defined category",
        ],
    },
};
// A super-simple mock of a redux store
const testStore = createReduxStore(state);

const withReduxSettings = {
    Provider,
    store: testStore,
    state,
    actions: [],
};

export const withReduxDecorator = withRedux(addons)(withReduxSettings);
