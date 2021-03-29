import { SortDirection } from "../redux/types";
import { WellPlotData } from "./dataUtil";
//Deault sort methods
export const SORT_BY_NAME = "well name";
export const SORT_BY_STRATIGRAPHY_DEPTH = "stratigraphy depth";
export const SORT_BY_COMPLETION_DATE = "earliest comp date";
const createSortKeyFunction = (
    sortMethod: string
): ((well: WellPlotData) => any) => {
    switch (sortMethod) {
        case SORT_BY_NAME:
            return (well) => well.name;
        case SORT_BY_STRATIGRAPHY_DEPTH:
            return (well) =>
                well.zoneIndices.find(
                    (_, index) => well.completions[index] > 0
                );
        case SORT_BY_COMPLETION_DATE:
            return (well) => well.earliestCompDateIndex;
        default:
            return (well) => well.attributes[sortMethod];
    }
};
export const createSortFunction = (sortBy: Record<string, SortDirection>) => {
    const keyFunctions = new Map(
        Object.keys(sortBy).map(
            (sort) =>
                [sort, createSortKeyFunction(sort)] as [
                    string,
                    (well: WellPlotData) => any
                ]
        )
    );
    return (a: WellPlotData, b: WellPlotData) => {
        for (const sort in sortBy) {
            const keyFunction = keyFunctions.get(sort)!;
            const aAttribute = keyFunction(a);
            const bAttribute = keyFunction(b);
            if (aAttribute === bAttribute) continue;
            if (
                (sortBy[sort] === "Ascending" && aAttribute < bAttribute) ||
                (sortBy[sort] !== "Ascending" && aAttribute > bAttribute) ||
                bAttribute === undefined
            )
                return -1;
            else return 1;
        }
        return 0;
    };
};
