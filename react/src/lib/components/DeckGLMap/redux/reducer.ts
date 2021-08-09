/* eslint-disable @typescript-eslint/no-explicit-any */
import { combineReducers, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DrawMode } from "./types";

export const specSlice = createSlice({
    name: "spec",
    initialState: {} as Record<string, unknown>,
    reducers: {
        setSpec: (_, action: PayloadAction<Record<string, unknown>>) =>
            action.payload,
        updateVisibleLayers: (
            state,
            action: PayloadAction<[string, boolean]>
        ) => {
            const layer = (state["layers"] as any[]).find(
                (layer) => layer.id === action.payload[0]
            );
            layer.visible = action.payload[1];
        },
        updateDrawingMode: (
            state,
            action: PayloadAction<[string, DrawMode]>
        ) => {
            const layer = (state["layers"] as any[]).find(
                (layer) => layer.id === action.payload[0]
            );
            if (layer["@@type"] === "DrawingLayer")
                layer.mode = action.payload[1];
        },
    },
});
export const rootReducer = combineReducers({
    spec: specSlice.reducer,
});
