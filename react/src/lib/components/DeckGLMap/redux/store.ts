import {
    configureStore,
    EnhancedStore,
    // eslint-disable-next-line prettier/prettier
    getDefaultMiddleware
} from "@reduxjs/toolkit";
import { enhancer } from "addon-redux";
import { Operation } from "fast-json-patch";
import { patchMiddleware } from "./middleware";
import { rootReducer } from "./reducer";

export type MapState = ReturnType<typeof rootReducer>;
export const createStore: (
    initialState: Record<string, unknown>,
    setSpecPatch: (patch: Operation[]) => void
) => EnhancedStore = (
    initialState: Record<string, unknown>,
    setSpecPatch: (patch: Operation[]) => void
) =>
    configureStore({
        reducer: rootReducer,
        enhancers: [enhancer],
        preloadedState: { spec: initialState },
        middleware: [patchMiddleware(setSpecPatch), ...getDefaultMiddleware()],
    });
