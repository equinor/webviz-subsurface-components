import { configureStore, EnhancedStore, StoreEnhancer } from "@reduxjs/toolkit";
import { rootReducer } from "./reducer";

/*
// #if process.env.NODE_RUNNING_STORYBOOK === "true"
import { enhancer } from "addon-redux";
// #endif
*/

const createEnhancer = () => {
    const enhancers: StoreEnhancer[] = [];
    /*
    // #if process.env.NODE_RUNNING_STORYBOOK === "true"
    enhancers.push(enhancer);
    // #endif
    */
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
