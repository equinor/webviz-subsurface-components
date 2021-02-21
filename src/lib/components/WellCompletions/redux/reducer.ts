import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RangeMode, UISettings } from "./types";

export const idSlice = createSlice({
    name: "id",
    initialState: "",
    reducers: {
        updateId: (_, action: PayloadAction<string>) => action.payload,
    },
});
export const uiSlice = createSlice({
    name: "ui",
    initialState: {
        timeIndexRange: [0, 0],
        wellsPerPage: 25,
        currentPage: 1,
        rangeDisplayMode: "First Step",
        wellSearchText: "",
        filteredZones: [],
        hideZeroCompletions: false,
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
        updateRangeDisplayMode: (state, action: PayloadAction<RangeMode>) => {
            state.rangeDisplayMode = action.payload;
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
    },
});

export const { updateId } = idSlice.actions;
export const {
    updateTimeIndexRange,
    updateRangeDisplayMode,
    updateWellsPerPage,
    updateCurrentPage,
    updateWellSearchText,
    updateFilteredZones,
    updateHideZeroCompletions,
} = uiSlice.actions;
