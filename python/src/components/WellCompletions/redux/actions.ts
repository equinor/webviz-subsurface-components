import { attributeSlice, idSlice, uiSlice } from "./reducer";

export const { updateId } = idSlice.actions;
export const { updateAttributeKeys } = attributeSlice.actions;
export const {
    updateTimeIndexRange,
    updateTimeAggregation,
    updateWellsPerPage,
    updateCurrentPage,
    updateWellSearchText,
    updateFilteredZones,
    updateHideZeroCompletions,
    updateSortKey,
    deleteSortKey,
    updateIsDrawerOpen,
    updateFilterByAttributes,
} = uiSlice.actions;
