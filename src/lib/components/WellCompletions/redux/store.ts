<<<<<<< HEAD
import { configureStore } from "@reduxjs/toolkit";
import withReduxEnhancer from "addon-redux/enhancer";
import { rootReducer } from "./reducer";
=======
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { attributeSlice, idSlice, uiSlice } from "./reducer";
import withReduxEnhancer from "addon-redux/enhancer";

export const rootReducer = combineReducers({
    id: idSlice.reducer,
    attributes: attributeSlice.reducer,
    ui: uiSlice.reducer,
});
>>>>>>> Add storybooks for well completions component

export type WellCompletionsState = ReturnType<typeof rootReducer>;
export const createReduxStore = (
    preloadedState: Partial<WellCompletionsState>
) =>
    configureStore({
        reducer: rootReducer,
        preloadedState,
        enhancers: [withReduxEnhancer],
    });
