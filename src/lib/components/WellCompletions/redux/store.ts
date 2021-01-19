import { configureStore } from "@reduxjs/toolkit";
import { slice } from "./reducer";

export const REDUX_STORE = configureStore({
    reducer: slice.reducer,
});
