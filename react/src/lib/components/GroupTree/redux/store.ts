import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { enhancer } from "addon-redux";
import { rootReducer } from "./reducer";

export type GroupTreeState = ReturnType<typeof rootReducer>;
export const createReduxStore = (
    preloadedState: Partial<GroupTreeState>
): EnhancedStore =>
    configureStore({
        reducer: rootReducer,
        preloadedState,
        enhancers: [enhancer],
    });
