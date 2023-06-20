import { combineReducers, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    Attributes,
    SortDirection,
    TimeAggregation,
    // eslint-disable-next-line prettier/prettier
    UISettings
} from "./types";

export const idSlice = createSlice({
    name: "id",
    initialState: "",
    reducers: {
        updateId: (_, action: PayloadAction<string>) => action.payload,
    },
});
export const attributeSlice = createSlice({
    name: "attribute",
    initialState: {
        attributeKeys: [],
    } as Attributes,
    reducers: {
        updateAttributeKeys: (state, action: PayloadAction<string[]>) => {
            state.attributeKeys = action.payload;
        },
    },
});
export const uiSlice = createSlice({
    name: "ui",
    initialState: {
        timeIndexRange: [0, 0],
        wellsPerPage: 25,
        currentPage: 1,
        timeAggregation: "None",
        sortBy: {},
        isDrawerOpen: false,
        wellSearchText: "",
        filteredZones: [],
        hideZeroCompletions: false,
        filterByAttributes: [],
    } as UISettings,
    reducers: {
        updateTimeIndexRange: (
            state,
            action: PayloadAction<[number, number]>
        ) => {
            state.timeIndexRange = action.payload;
        },
        updateWellsPerPage: (state, action: PayloadAction<number>) => {
            state.wellsPerPage = action.payload;
        },
        updateCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        updateTimeAggregation: (
            state,
            action: PayloadAction<TimeAggregation>
        ) => {
            state.timeAggregation = action.payload;
        },
        updateIsDrawerOpen: (state, action: PayloadAction<boolean>) => {
            state.isDrawerOpen = action.payload;
        },
        updateWellSearchText: (state, action: PayloadAction<string>) => {
            state.wellSearchText = action.payload;
        },
        updateFilteredZones: (state, action: PayloadAction<string[]>) => {
            state.filteredZones = action.payload;
        },
        updateHideZeroCompletions: (state, action: PayloadAction<boolean>) => {
            state.hideZeroCompletions = action.payload;
        },
        updateFilterByAttributes: (state, action: PayloadAction<string[]>) => {
            state.filterByAttributes = action.payload;
        },
        updateSortKey: (
            state,
            action: PayloadAction<{
                sortKey: string;
                sortDirection: SortDirection;
            }>
        ) => {
            const newSortBy = {
                ...state.sortBy,
                [action.payload.sortKey]: action.payload.sortDirection,
            };
            state.sortBy = newSortBy;
        },
        deleteSortKey: (state, action: PayloadAction<string>) => {
            const newSortBy = Object.keys(state.sortBy).reduce(
                (acc: Record<string, SortDirection>, current) => {
                    if (current !== action.payload) {
                        acc[current] = state.sortBy[current];
                    }
                    return acc;
                },
                {}
            );
            state.sortBy = newSortBy;
        },
    },
});

export const rootReducer = combineReducers({
    id: idSlice.reducer,
    attributes: attributeSlice.reducer,
    ui: uiSlice.reducer,
});
