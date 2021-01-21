import { configureStore } from "@reduxjs/toolkit";
import { dataModelSlice, idSlice, uiSlice } from "./reducer";

export const REDUX_STORE = configureStore({
    reducer: {
        id: idSlice.reducer,
        dataModel: dataModelSlice.reducer,
        ui: uiSlice.reducer,
    },
});

export type WellCompletionsState = ReturnType<typeof REDUX_STORE.getState>;
