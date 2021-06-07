import { combineReducers, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DrawingSettings, DrawMode } from "./types";

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
            const layer = (state.layers as any[]).find(
                (layer) => layer.id === action.payload[0]
            );
            layer.visible = action.payload[1];
        },
    },
});

export const drawingSlice = createSlice({
    name: "drawing",
    initialState: {
        mode: "view",
    } as DrawingSettings,
    reducers: {
        updateDrawingMode: (state, action: PayloadAction<DrawMode>) => {
            state.mode = action.payload;
        },
    },
});
export const rootReducer = combineReducers({
    spec: specSlice.reducer,
    drawing: drawingSlice.reducer,
});
