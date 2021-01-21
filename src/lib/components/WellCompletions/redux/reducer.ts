import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Data, UISettings } from "./types";

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
    initialState: { timeIndexRange: [0, 0] } as UISettings,
    reducers: {
        updateTimeIndexRange: (
            state,
            action: PayloadAction<[number, number]>
        ) => {
            state.timeIndexRange = action.payload;
        },
    },
});

export const { updateId } = idSlice.actions;
export const { updateData } = dataModelSlice.actions;
export const { updateTimeIndexRange } = uiSlice.actions;
