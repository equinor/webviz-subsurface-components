import { UISettings } from "../redux/types";
import {
    SORT_BY_COMPLETION_DATE,
    SORT_BY_NAME,
    // eslint-disable-next-line prettier/prettier
    SORT_BY_STRATIGRAPHY_DEPTH
} from "../utils/sort";
export const testState = {
    id: "test",
    ui: {
        timeIndexRange: [0, 9],
        wellsPerPage: 25,
        currentPage: 1,
        timeAggregation: "None",
        isDrawerOpen: false,
        wellSearchText: "",
        filteredZones: [],
        hideZeroCompletions: false,
        sortBy: {},
        filterByAttributes: [],
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
