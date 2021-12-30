import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducer";
import { enhancer } from "addon-redux";

export type MapState = ReturnType<typeof rootReducer>;
export const createStore: (
    initialState: Record<string, unknown>
) => EnhancedStore = (initialState: Record<string, unknown>) =>
    configureStore({
        reducer: rootReducer,
        preloadedState: { spec: initialState },
        enhancers: [enhancer],
    });
