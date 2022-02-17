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

export type MapState = ReturnType<typeof rootReducer>;
export const createStore: (
    initialState: Record<string, unknown>
) => EnhancedStore = (initialState: Record<string, unknown>) =>
    configureStore({
        reducer: rootReducer,
        preloadedState: { spec: initialState },
        enhancers: createEnhancer(),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [
                        "spec/setSpec",
                        "spec/updateLayerProp",
                        "spec/updateVisibleLayers",
                        "spec/updateDrawingMode",
                    ],
                },
            }),
    });
