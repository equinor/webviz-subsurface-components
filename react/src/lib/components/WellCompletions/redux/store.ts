import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducer";

const createEnhancer = () => {
    const enhancers = [];
    if (process.env["NODE_ENV"] !== "production") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const enhancer = require("addon-redux").enhancer;
        enhancers.push(enhancer);
    }
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
