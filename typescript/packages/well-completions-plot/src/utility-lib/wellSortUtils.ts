import { SortWellsBy, SortDirection } from "../types/dataTypes";
import type { WellPlotData } from "../types/dataTypes";

/**
 * Create function returning the compare value(s) for the WellPlotData object.
 *
 * Returns a callable function which returns the compare value(s) for a WellPlotData object based on given SortWellsBy.
 * Can be used for for sorting list WellPlotData objects. I.e. provide the well
 * and return the name, index to sort by, or an array of zone indices from lowest to highest. If the value is not found, undefined is returned.
 *
 * @param sortWellsBy Sort method wanted when using the compare value
 * @returns Function returning the compare value(s) for a WellPlotData object, based on the provided SortWellsBy
 */
export function createGetWellPlotDataCompareValueFunction(
    sortWellsBy: SortWellsBy
): (well: WellPlotData) => string | number | number[] | undefined {
    if (sortWellsBy === SortWellsBy.WELL_NAME) {
        return (well: WellPlotData) => well.name;
    }
    if (sortWellsBy === SortWellsBy.STRATIGRAPHY_DEPTH) {
        // Returns an array of increasing zone indices with completion open > 0 to sort by
        // This assumes that that increasing index is increased stratigraphic depth (must be pre-processed)
        return (well: WellPlotData) => {
            const sortedZoneIndicesWithOpenCompletions = well.completions
                .filter((_, index) => well.completions[index]!.open > 0)
                .map((elm) => elm.zoneIndex)
                .sort((a, b) => a - b);

            return sortedZoneIndicesWithOpenCompletions;
        };
    }
    if (sortWellsBy === SortWellsBy.EARLIEST_COMPLETION_DATE) {
        // Returns earliest completion date index, i.e. assuming sorted array of completion dates
        return (well: WellPlotData) => well.earliestCompDateIndex;
    }

    // Unhandled sort wells by
    return () => undefined;
}

/**
 * Compare two WellPlotData elements based on the value from getWellPlotDataCompareValueFunction and requested direction
 *
 * @param a First element for comparison
 * @param b Second element for comparison
 * @param getWellPlotDataCompareValueFunction Callback for getting the WellPlotData object value(s) to compare by.
 * @param sortDirection Direction to sort by
 * @returns 0 if equal. For ascending: -1 if a is less than b, 1 if a is greater than b. For descending: 1 if a is less than b, -1 if a is greater than b.
 */
export function compareWellPlotDataValues<WellPlotData>(
    a: WellPlotData,
    b: WellPlotData,
    getWellPlotDataCompareValueFunction: (
        item: WellPlotData
    ) => string | number | number[] | undefined,
    sortDirection: SortDirection
): 0 | 1 | -1 {
    if (a === b) {
        // Compare by reference for early exit
        return 0;
    }

    const aValue = getWellPlotDataCompareValueFunction(a);
    const bValue = getWellPlotDataCompareValueFunction(b);

    // Return type of compare values should be equal
    if (typeof aValue !== typeof bValue) {
        return 0;
    }

    if (aValue === bValue) {
        return 0;
    }
    if (aValue === undefined) {
        return sortDirection === SortDirection.ASCENDING ? 1 : -1;
    }
    if (bValue === undefined) {
        return sortDirection === SortDirection.ASCENDING ? -1 : 1;
    }
    if (Array.isArray(aValue) && Array.isArray(bValue)) {
        if (aValue.length === 0 && bValue.length === 0) {
            return 0;
        }
        if (aValue.length === 0) {
            // 'a' has no completions, place it last
            return sortDirection === SortDirection.ASCENDING ? 1 : -1;
        }
        if (bValue.length === 0) {
            // 'b' has no completions, place it last
            return sortDirection === SortDirection.ASCENDING ? -1 : 1;
        }

        // Compare arrays element by element for the common length
        // - The well with lowest element at given index is considered less
        const commonLength = Math.min(aValue.length, bValue.length);
        for (let i = 0; i < commonLength; i++) {
            if (aValue[i] < bValue[i]) {
                return sortDirection === SortDirection.ASCENDING ? -1 : 1;
            }
            if (aValue[i] > bValue[i]) {
                return sortDirection === SortDirection.ASCENDING ? 1 : -1;
            }
        }

        // If the common parts are equal, compare by length - longest first (i.e. more completions)
        if (aValue.length < bValue.length) {
            return sortDirection === SortDirection.ASCENDING ? 1 : -1;
        }
        if (aValue.length > bValue.length) {
            return sortDirection === SortDirection.ASCENDING ? -1 : 1;
        }

        // The arrays are equal
        return 0;
    }
    if (aValue < bValue) {
        return sortDirection === SortDirection.ASCENDING ? -1 : 1;
    }

    return sortDirection === SortDirection.ASCENDING ? 1 : -1;
}

/**
 * Compare two WellPlotData elements based on the attribute to sort by and direction
 *
 * When a and b are equal, the original order is preserved (ref. Array.prototype.sort()).
 *
 * @param a First element for comparison
 * @param b Second element for comparison
 * @param sortWellsBy Sort method to use
 * @param sortDirection Direction to sort by
 * @returns 0 if equal. For ascending: -1 if a is less than b, 1 if a is greater than b. For descending: 1 if a is less than b, -1 if a is greater than b.
 */
export function compareWellsBySortByAndDirection(
    a: WellPlotData,
    b: WellPlotData,
    sortWellsBy: SortWellsBy,
    sortDirection: SortDirection
): 0 | 1 | -1 {
    const getWellPlotDataCompareValue =
        createGetWellPlotDataCompareValueFunction(sortWellsBy);

    return compareWellPlotDataValues(
        a,
        b,
        getWellPlotDataCompareValue,
        sortDirection
    );
}

/**
 * Create sorted array of WellPlotData objects
 *
 * Sort the provided array of well according to selected SortWellsBy and sort direction.
 *
 * When two elements are equal, the original order is preserved (ref. Array.prototype.sort()).
 *
 * @param wells Array of WellPlotData objects to sort
 * @param sortWellsBy Sort wells by selection
 * @param sortDirection Direction to sort by
 * @returns Sorted array of WellPlotData objects
 */
export function createSortedWells(
    wells: WellPlotData[],
    sortWellsBy: SortWellsBy,
    sortDirection: SortDirection
): WellPlotData[] {
    const getWellPlotDataCompareValue =
        createGetWellPlotDataCompareValueFunction(sortWellsBy);

    // Equal a and b elements will keep their original order
    const sortedWellsArray = Array.from(wells).sort((a, b) =>
        compareWellPlotDataValues(
            a,
            b,
            getWellPlotDataCompareValue,
            sortDirection
        )
    );

    return sortedWellsArray;
}

/**
 * Create sorted array of WellPlotData objects
 *
 * Sort the provided array of well according to provided sort methods and corresponding directions.
 * The sort methods are applied in sequence in the order they are provided.
 *
 * @param wells Array of WellPlotData objects to sort
 * @param sortWellsBySequence Map of SortWellsBy selections and corresponding sort directions to use, in the order they should be applied
 * @returns Sorted array of WellPlotData objects
 */
export function createSortedWellsFromSequence(
    wells: WellPlotData[],
    sortWellsBySequence: Map<SortWellsBy, SortDirection>
): WellPlotData[] {
    // Build list of compare functions in order of provided selections
    const compareFunctions = Array.from(sortWellsBySequence).map(
        ([sortWellsBy, sortDirection]) => {
            return (a: WellPlotData, b: WellPlotData) =>
                compareWellsBySortByAndDirection(
                    a,
                    b,
                    sortWellsBy,
                    sortDirection
                );
        }
    );

    // Apply compare functions in order to sort the wells
    const sortedWellsArray = Array.from(wells).sort((a, b) => {
        for (const compareValueFunction of compareFunctions) {
            const result = compareValueFunction(a, b);
            if (result !== 0) {
                return result;
            }
        }
        return 0;
    });

    return sortedWellsArray;
}
