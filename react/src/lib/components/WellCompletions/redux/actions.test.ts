import configureStore from "redux-mock-store"; //ES6 modules
import { testState } from "../test/testReduxState";
import {
    deleteSortKey,
    updateAttributeKeys,
    updateCurrentPage,
    updateFilterByAttributes,
    updateFilteredZones,
    updateHideZeroCompletions,
    updateId,
    updateIsDrawerOpen,
    updateSortKey,
    updateTimeAggregation,
    updateTimeIndexRange,
    updateWellSearchText,
    // eslint-disable-next-line prettier/prettier
    updateWellsPerPage
} from "./actions";
import { SortDirection } from "./types";

const middlewares = [];
const mockStore = configureStore(middlewares);
describe("test actions", () => {
    it("test updateId", () => {
        const store = mockStore(testState);
        store.dispatch(updateId("TEST"));

        const actions = store.getActions();
        expect(actions).toEqual([{ payload: "TEST", type: "id/updateId" }]);
    });

    it("test updateAttributeKeys", () => {
        const store = mockStore(testState);
        const attributeKeys = ["type", "region", "user defined category"];
        store.dispatch(updateAttributeKeys(attributeKeys));

        const actions = store.getActions();
        expect(actions).toEqual([
            { payload: attributeKeys, type: "attribute/updateAttributeKeys" },
        ]);
    });
    it("test updateTimeIndexRange", () => {
        const store = mockStore(testState);
        store.dispatch(updateTimeIndexRange([1, 3]));

        const actions = store.getActions();
        expect(actions).toEqual([
            { payload: [1, 3], type: "ui/updateTimeIndexRange" },
        ]);
    });
    it("test updateTimeAggregation", () => {
        const store = mockStore(testState);
        store.dispatch(updateTimeAggregation("Average"));

        const actions = store.getActions();
        expect(actions).toEqual([
            { payload: "Average", type: "ui/updateTimeAggregation" },
        ]);
    });

    it("test updateWellsPerPage", () => {
        const store = mockStore(testState);
        store.dispatch(updateWellsPerPage(50));

        const actions = store.getActions();
        expect(actions).toEqual([
            { payload: 50, type: "ui/updateWellsPerPage" },
        ]);
    });
    it("test updateCurrentPage", () => {
        const store = mockStore(testState);
        store.dispatch(updateCurrentPage(2));

        const actions = store.getActions();
        expect(actions).toEqual([{ payload: 2, type: "ui/updateCurrentPage" }]);
    });
    it("test updateWellSearchText", () => {
        const store = mockStore(testState);
        store.dispatch(updateWellSearchText("well2"));

        const actions = store.getActions();
        expect(actions).toEqual([
            { payload: "well2", type: "ui/updateWellSearchText" },
        ]);
    });

    it("test updateFilteredZones", () => {
        const store = mockStore(testState);
        store.dispatch(updateFilteredZones(["zone1", "zone2"]));

        const actions = store.getActions();
        expect(actions).toEqual([
            { payload: ["zone1", "zone2"], type: "ui/updateFilteredZones" },
        ]);
    });

    it("test updateHideZeroCompletions", () => {
        const store = mockStore(testState);
        store.dispatch(updateHideZeroCompletions(true));

        const actions = store.getActions();
        expect(actions).toEqual([
            {
                payload: true,
                type: "ui/updateHideZeroCompletions",
            },
        ]);
    });
    it("test updateFilterByAttributes", () => {
        const store = mockStore(testState);
        store.dispatch(updateFilterByAttributes([]));

        const actions = store.getActions();
        expect(actions).toEqual([
            {
                payload: [],
                type: "ui/updateFilterByAttributes",
            },
        ]);
    });
    it("test updateIsDrawerOpen", () => {
        const store = mockStore(testState);
        store.dispatch(updateIsDrawerOpen(true));

        const actions = store.getActions();
        expect(actions).toEqual([
            {
                payload: true,
                type: "ui/updateIsDrawerOpen",
            },
        ]);
    });

    it("test updateSortKey", () => {
        const store = mockStore(testState);
        const newSort = {
            sortKey: "name",
            sortDirection: "Ascending" as SortDirection,
        };
        store.dispatch(updateSortKey(newSort));

        const actions = store.getActions();
        expect(actions).toEqual([
            {
                payload: newSort,
                type: "ui/updateSortKey",
            },
        ]);
    });

    it("test deleteSortKey", () => {
        const store = mockStore(testState);
        store.dispatch(deleteSortKey("name"));

        const actions = store.getActions();
        expect(actions).toEqual([
            {
                payload: "name",
                type: "ui/deleteSortKey",
            },
        ]);
    });
});
