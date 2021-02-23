import { configureStore } from "@reduxjs/toolkit";
import { attributeSlice, idSlice, uiSlice } from "./reducer";

export const REDUX_STORE = configureStore({
    reducer: {
        id: idSlice.reducer,
        attributes: attributeSlice.reducer,
        ui: uiSlice.reducer,
    },
});

export type WellCompletionsState = ReturnType<typeof REDUX_STORE.getState>;
