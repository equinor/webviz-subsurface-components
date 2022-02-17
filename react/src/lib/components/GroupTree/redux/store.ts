import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { enhancer } from "addon-redux";
import { rootReducer } from "./reducer";

const createEnhancer = () => {
    const enhancers = [];
    if (process.env["NODE_ENV"] !== "production") {
        enhancers.push(enhancer);
    }
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
