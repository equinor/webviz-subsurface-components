import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import withReduxEnhancer from "addon-redux/enhancer";
import { rootReducer } from "./reducer";

export type WellCompletionsState = ReturnType<typeof rootReducer>;
export const createReduxStore = (
    preloadedState: Partial<WellCompletionsState>
): EnhancedStore =>
    configureStore({
        reducer: rootReducer,
        preloadedState,
        enhancers: [withReduxEnhancer],
    });
