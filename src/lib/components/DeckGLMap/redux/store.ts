import {
    configureStore,
    EnhancedStore,
    // eslint-disable-next-line prettier/prettier
    getDefaultMiddleware
} from "@reduxjs/toolkit";
import withReduxEnhancer from "addon-redux/enhancer";
import { Operation } from "fast-json-patch";
import { patchMiddleware } from "./middleware";
import { rootReducer } from "./reducer";

export type MapState = ReturnType<typeof rootReducer>;
export const createStore: (
    patchSpec: (patch: Operation[]) => void
) => EnhancedStore = (patchSpec: (patch: Operation[]) => void) =>
    configureStore({
        reducer: rootReducer,
        enhancers: [withReduxEnhancer],
        middleware: [patchMiddleware(patchSpec), ...getDefaultMiddleware()],
    });
