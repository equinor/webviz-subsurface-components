import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Data, RangeMode, UISettings } from "./types";

export const idSlice = createSlice({
    name: "id",
    initialState: "",
    reducers: {
        updateId: (state, action: PayloadAction<string>) => action.payload,
    },
});
export const dataModelSlice = createSlice({
    name: "dataModel",
    initialState: {
        data: undefined as Data | undefined,
    },
    reducers: {
        updateData: (state, action: PayloadAction<Data>) => {
            state.data = action.payload;
        },
    },
});
export const uiSlice = createSlice({
    name: "ui",
    initialState: {
        timeIndexRange: [0, 0],
        animating: false,
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
        updateAnimating: (state, action: PayloadAction<boolean>) => {
            state.animating = action.payload;
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
export const { updateData } = dataModelSlice.actions;
export const {
    updateTimeIndexRange,
    updateRangeDisplayMode,
    updateAnimating,
    updateWellSearchText,
    updateFilteredZones,
    updateHideZeroCompletions,
} = uiSlice.actions;
