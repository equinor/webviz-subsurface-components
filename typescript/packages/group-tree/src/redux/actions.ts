import { idSlice, uiSlice } from "./reducer";

export const { updateId } = idSlice.actions;
export const {
    updateCurrentDateTime,
    updateCurrentFlowRate,
    updateCurrentNodeInfo,
} = uiSlice.actions;
