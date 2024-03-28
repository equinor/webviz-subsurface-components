import type { EnhancedStore } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducer";

export type MapState = ReturnType<typeof rootReducer>;
export const createStore: (
    initialState: Record<string, unknown>
) => EnhancedStore = (initialState: Record<string, unknown>) =>
    configureStore({
        reducer: rootReducer,
        preloadedState: { spec: initialState },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }),
    });
