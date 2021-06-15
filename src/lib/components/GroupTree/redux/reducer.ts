import { combineReducers, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FlowRate, UISettings } from "./types";

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
        currentIteration: "",
        currentDateTime: "",
        currentFlowRate: "oilrate",
    } as UISettings,
    reducers: {
        updateCurrentIteration: (
            state,
            action: PayloadAction<[string, string]>
        ) => {
            [state.currentIteration, state.currentDateTime] = action.payload;
        },
        updateCurrentDateTime: (state, action: PayloadAction<string>) => {
            state.currentDateTime = action.payload;
        },
        updateCurrentFlowRate: (state, action: PayloadAction<FlowRate>) => {
            state.currentFlowRate = action.payload;
        },
    },
});

export const rootReducer = combineReducers({
    id: idSlice.reducer,
    ui: uiSlice.reducer,
});
