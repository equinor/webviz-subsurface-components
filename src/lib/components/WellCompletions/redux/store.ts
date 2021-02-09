import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { dataModelSlice, idSlice, uiSlice } from "./reducer";

export const REDUX_STORE = configureStore({
    reducer: {
        id: idSlice.reducer,
        dataModel: dataModelSlice.reducer,
        ui: uiSlice.reducer,
    },
    middleware: [...getDefaultMiddleware({ immutableCheck: false })],
});

export type WellCompletionsState = ReturnType<typeof REDUX_STORE.getState>;
