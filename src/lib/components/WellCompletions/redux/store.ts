import { configureStore } from "@reduxjs/toolkit";
import { idSlice, uiSlice } from "./reducer";

export const REDUX_STORE = configureStore({
    reducer: {
        id: idSlice.reducer,
        ui: uiSlice.reducer,
    },
});

export type WellCompletionsState = ReturnType<typeof REDUX_STORE.getState>;
