import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducer";

// #if process.env.NODE_ENV !== "production"
import { enhancer } from "addon-redux";
// #endif

const createEnhancer = () => {
    const enhancers = [];
    // #if process.env["NODE_ENV"] !== "production"
    enhancers.push(enhancer);
    // #endif
    return enhancers;
};

export type WellCompletionsState = ReturnType<typeof rootReducer>;
export const createReduxStore = (
    preloadedState: Partial<WellCompletionsState>
): EnhancedStore =>
    configureStore({
        reducer: rootReducer,
        preloadedState,
        enhancers: createEnhancer(),
    });
