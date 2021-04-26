import { attributeSlice, idSlice, uiSlice } from "./reducer";

export const { updateId } = idSlice.actions;
export const { updateAttributeKeys } = attributeSlice.actions;
export const {
    updateTimeIndexRange,
    updateRangeDisplayMode,
    updateWellsPerPage,
    updateCurrentPage,
    updateWellSearchText,
    updateFilteredZones,
    updateHideZeroCompletions,
    updateSortKey,
    deleteSortKey,
    updateFilterByAttributes,
} = uiSlice.actions;
