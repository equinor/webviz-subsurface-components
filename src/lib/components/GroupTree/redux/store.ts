import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import withReduxEnhancer from "addon-redux/enhancer";
import { rootReducer } from "./reducer";

export type GroupTreeState = ReturnType<typeof rootReducer>;
export const createReduxStore = (
    preloadedState: Partial<GroupTreeState>
): EnhancedStore =>
    configureStore({
        reducer: rootReducer,
        preloadedState,
        enhancers: [withReduxEnhancer],
    });
