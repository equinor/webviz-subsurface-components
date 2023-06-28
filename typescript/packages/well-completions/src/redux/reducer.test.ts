import { testState } from "../test/testReduxState";
import { rootReducer } from "./reducer";
import { SortDirection } from "./types";

describe("test actions", () => {
    it("test updateId", () => {
        expect(
            rootReducer(testState, { payload: "TEST", type: "id/updateId" })
        ).toEqual({
            ...testState,
            id: "TEST",
        });
    });

    it("test updateAttributeKeys", () => {
        const attributeKeys = ["type", "region", "user defined category"];
        expect(
            rootReducer(testState, {
                payload: attributeKeys,
                type: "attribute/updateAttributeKeys",
            })
        ).toEqual({
            ...testState,
            attributes: { attributeKeys: attributeKeys },
        });
    });
    it("test updateTimeIndexRange", () => {
        expect(
            rootReducer(testState, {
                payload: [1, 3],
                type: "ui/updateTimeIndexRange",
            })
        ).toEqual({
            ...testState,
            ui: { ...testState.ui, timeIndexRange: [1, 3] },
        });
    });
    it("test updateTimeAggregation", () => {
        expect(
            rootReducer(testState, {
                payload: "Average",
                type: "ui/updateTimeAggregation",
            })
        ).toEqual({
            ...testState,
            ui: { ...testState.ui, timeAggregation: "Average" },
        });
    });

    it("test updateWellsPerPage", () => {
        expect(
            rootReducer(testState, {
                payload: 50,
                type: "ui/updateWellsPerPage",
            })
        ).toEqual({
            ...testState,
            ui: { ...testState.ui, wellsPerPage: 50 },
        });
    });
    it("test updateCurrentPage", () => {
        expect(
            rootReducer(testState, { payload: 2, type: "ui/updateCurrentPage" })
        ).toEqual({
            ...testState,
            ui: { ...testState.ui, currentPage: 2 },
        });
    });
    it("test updateWellSearchText", () => {
        expect(
            rootReducer(testState, {
                payload: "well2",
                type: "ui/updateWellSearchText",
            })
        ).toEqual({
            ...testState,
            ui: { ...testState.ui, wellSearchText: "well2" },
        });
    });

    it("test updateFilteredZones", () => {
        expect(
            rootReducer(testState, {
                payload: ["zone1", "zone2"],
                type: "ui/updateFilteredZones",
            })
        ).toEqual({
            ...testState,
            ui: { ...testState.ui, filteredZones: ["zone1", "zone2"] },
        });
    });

    it("test updateHideZeroCompletions", () => {
        expect(
            rootReducer(testState, {
                payload: true,
                type: "ui/updateHideZeroCompletions",
            })
        ).toEqual({
            ...testState,
            ui: { ...testState.ui, hideZeroCompletions: true },
        });
    });
    it("test updateFilterByAttributes", () => {
        expect(
            rootReducer(testState, {
                payload: [],
                type: "ui/updateFilterByAttributes",
            })
        ).toEqual({
            ...testState,
            ui: { ...testState.ui, filterByAttributes: [] },
        });
    });
    it("test updateIsDrawerOpen", () => {
        expect(
            rootReducer(testState, {
                payload: true,
                type: "ui/updateIsDrawerOpen",
            })
        ).toEqual({
            ...testState,
            ui: { ...testState.ui, isDrawerOpen: true },
        });
    });

    it("test updateSortKey", () => {
        const newSort = {
            sortKey: "name",
            sortDirection: "Ascending" as SortDirection,
        };
        expect(
            rootReducer(testState, {
                payload: newSort,
                type: "ui/updateSortKey",
            })
        ).toEqual({
            ...testState,
            ui: { ...testState.ui, sortBy: { name: "Ascending" } },
        });
    });

    it("test deleteSortKey", () => {
        expect(
            rootReducer(testState, {
                payload: "name",
                type: "ui/deleteSortKey",
            })
        ).toEqual({
            ...testState,
            ui: { ...testState.ui, sortBy: {} },
        });
    });
});
