import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { enhancer } from "addon-redux";
import { rootReducer } from "./reducer";

export type WellCompletionsState = ReturnType<typeof rootReducer>;
export const createReduxStore = (
    preloadedState: Partial<WellCompletionsState>
): EnhancedStore =>
    configureStore({
        reducer: rootReducer,
        preloadedState,
        enhancers: [enhancer],
    });
