import { UISettings } from "../redux/types";
import { SortBy } from "../../../../well-completions-plot/src";

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
            SortBy.Name,
            SortBy.StratigraphyDepth,
            SortBy.CompletionDate,
            "type",
            "region",
            "user defined category",
        ],
    },
};
