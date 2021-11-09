import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducer";
import { LayerProps } from "@deck.gl/core/lib/layer";

export type MapState = ReturnType<typeof rootReducer>;
export const createStore: (
    initialState: LayerProps<unknown>[]
) => EnhancedStore = (initialState: LayerProps<unknown>[]) =>
    configureStore({
        reducer: rootReducer,
        preloadedState: { layers: initialState },
    });
