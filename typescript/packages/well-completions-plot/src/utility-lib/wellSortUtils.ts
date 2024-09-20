import { SortWellsBy, SortDirection } from "../types/dataTypes";
import type { WellPlotData } from "../types/dataTypes";

/**
 * Create function returning the compare value for the WellPlotData object.
 *
 * Returns a callable function which returns the compare value for a WellPlotData object based on given SortWellsBy.
 * Can be used for for sorting list WellPlotData objects. I.e. provide the well
 * and return the name, or index to sort by. If the value is not found, undefined is returned.
 *
 * @param sortWellsBy Sort method wanted when using the compare value
 * @returns Function returning the compare value for a WellPlotData object, based on the provided SortWellsBy
 */
export function createGetWellPlotDataCompareValueFunction(
    sortWellsBy: SortWellsBy
): (well: WellPlotData) => string | number | undefined {
    if (sortWellsBy === SortWellsBy.WELL_NAME) {
        return (well: WellPlotData) => well.name;
    }
    if (sortWellsBy === SortWellsBy.STRATIGRAPHY_DEPTH) {
        return (well: WellPlotData) =>
            well.completions.find(
                (_, index) => well.completions[index]!.open > 0
            )?.zoneIndex;
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
 * @param getWellPlotDataCompareValueFunction Callback for getting the WellPlotData object value to compare by
 * @param sortDirection Direction to sort by
 * @returns 0 if equal. For ascending: -1 if a is less than b, 1 if a is greater than b. For descending: 1 if a is less than b, -1 if a is greater than b.
 */
export function compareWellPlotDataValues<WellPlotData>(
    a: WellPlotData,
    b: WellPlotData,
    getWellPlotDataCompareValueFunction: (
        item: WellPlotData
    ) => string | number | undefined,
    sortDirection: SortDirection
): 0 | 1 | -1 {
    const aValue = getWellPlotDataCompareValueFunction(a);
    const bValue = getWellPlotDataCompareValueFunction(b);

    if (aValue === bValue) {
        return 0;
    }
    if (aValue === undefined) {
        return sortDirection === SortDirection.ASCENDING ? 1 : -1;
    }
    if (bValue === undefined) {
        return sortDirection === SortDirection.ASCENDING ? -1 : 1;
    }
    if (aValue < bValue) {
        return sortDirection === SortDirection.ASCENDING ? -1 : 1;
    }
    return sortDirection === SortDirection.ASCENDING ? 1 : -1;
}

/**
 * Compare two WellPlotData elements based on the attribute to sort by and direction
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
 * Sort the provided array of well according to selected SortWellsBy and sort direction
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
