import { configureStore, EnhancedStore, StoreEnhancer } from "@reduxjs/toolkit";
import { rootReducer } from "./reducer";

// #if process.env.NODE_ENV !== "production"
import { enhancer } from "addon-redux";
// #endif

const createEnhancer = () => {
    // @rmt: Added type
    const enhancers: StoreEnhancer[] = [];
    // #if process.env.NODE_ENV !== "production"
    enhancers.push(enhancer);
    // #endif
    return enhancers;
};

export type GroupTreeState = ReturnType<typeof rootReducer>;
export const createReduxStore = (
    preloadedState: Partial<GroupTreeState>
): EnhancedStore =>
    configureStore({
        reducer: rootReducer,
        preloadedState,
        enhancers: createEnhancer(),
    });
