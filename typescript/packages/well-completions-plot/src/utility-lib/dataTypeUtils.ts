import type { CompletionPlotData, Zone } from "../types/dataTypes";

/**
 * Compare the values of to CompletionPlotData objects
 * @param completionsPlotData
 * @param otherCompletionsPlotData
 * @returns True of the values of the two CompletionPlotData objects are equal
 */
export function areCompletionsPlotDataValuesEqual(
    completionsPlotData: CompletionPlotData,
    otherCompletionsPlotData: CompletionPlotData
): boolean {
    return (
        completionsPlotData.open === otherCompletionsPlotData.open &&
        completionsPlotData.shut === otherCompletionsPlotData.shut &&
        completionsPlotData.khMean === otherCompletionsPlotData.khMean &&
        completionsPlotData.khMin === otherCompletionsPlotData.khMin &&
        completionsPlotData.khMax === otherCompletionsPlotData.khMax
    );
}

/**
 * Extract all subzones from a zone, using depth first search.
 *
 * I.e. all leaf nodes of the provided zone are added to the result.
 * If the zone has no subzones, the zone itself is returned.
 *
 * @param zone The zone to extract subzones from
 * @returns An array of all subzones (leaf nodes) of the zone
 */
export function extractSubzones(zone: Zone | undefined): Zone[] {
    const result: Zone[] = [];

    if (!zone) {
        return result;
    }

    const { subzones } = zone;

    if (subzones === undefined || subzones.length === 0) {
        result.push(zone);
        return result;
    }

    // Recursively find subzones
    subzones.forEach((zone) => {
        result.push(...extractSubzones(zone));
    });

    return result;
}

/**
 * Populate array of subzones from a zone, using depth first search.
 *
 * I.e. all leaf nodes of the provided zone are added to the array.
 * If the zone has no subzones, the zone itself is added to the array.
 *
 * @param zone The zone to populate subzones from
 * @param subzonesArray The array to populate with subzones
 */
export const populateSubzonesArray = (
    zone: Zone | undefined,
    subzonesArray: Zone[]
): void => {
    if (zone === undefined) {
        return;
    }

    const { subzones } = zone;

    if (subzones === undefined || subzones.length === 0) {
        subzonesArray.push(zone);
        return;
    }

    subzones.forEach((zone) => populateSubzonesArray(zone, subzonesArray));
};
