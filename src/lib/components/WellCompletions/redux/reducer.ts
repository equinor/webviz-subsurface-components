import { createSlice } from "@reduxjs/toolkit";
import { setTimeIndexRange, setTimesArray } from "./actions";

export interface WellCompletionsState {
    times: string[];
    timeIndexRange: [number, number] | undefined;
}

const initialState: WellCompletionsState = {
    times: [],
    timeIndexRange: undefined,
};

export const slice = createSlice({
    name: "WellCompletions",
    initialState,
    reducers: {
        updateTimesArray: setTimesArray,
        updateTimeIndexRange: setTimeIndexRange,
    },
});

export const { updateTimesArray, updateTimeIndexRange } = slice.actions;
