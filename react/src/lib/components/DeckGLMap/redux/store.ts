import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducer";

const createEnhancer = () => {
    const enhancers = [];
    if (process.env["NODE_ENV"] !== "production") {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const enhancer = require("addon-redux").enhancer;
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
