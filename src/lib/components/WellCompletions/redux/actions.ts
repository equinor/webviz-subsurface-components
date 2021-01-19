import { PayloadAction } from "@reduxjs/toolkit";
import { WellCompletionsState } from "./reducer";

export const setTimesArray = (
    state: WellCompletionsState,
    action: PayloadAction<string[]>
): void => {
    state.times = action.payload;
};

export const setTimeIndexRange = (
    state: WellCompletionsState,
    action: PayloadAction<[number, number]>
): void => {
    state.timeIndexRange = action.payload;
};
