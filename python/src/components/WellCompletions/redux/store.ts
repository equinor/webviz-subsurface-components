import type { EnhancedStore } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducer";

export type WellCompletionsState = ReturnType<typeof rootReducer>;
export const createReduxStore = (
    preloadedState: Partial<WellCompletionsState>
): EnhancedStore =>
    configureStore({
        reducer: rootReducer,
        preloadedState,
        enhancers: [],
    });
