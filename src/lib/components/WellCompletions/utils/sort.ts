import { AttributeType, SortDirection } from "../redux/types";
import { WellPlotData } from "./dataUtil";
//Deault sort methods
export const SORT_BY_NAME = "well name";
export const SORT_BY_STRATIGRAPHY_DEPTH = "stratigraphy depth";
export const SORT_BY_COMPLETION_DATE = "earliest comp date";
export const createAttributeKeyFunction = (
    sortMethod: string
): ((well: WellPlotData) => AttributeType) => {
    switch (sortMethod) {
        case SORT_BY_NAME:
            return (well) => well.name;
        case SORT_BY_STRATIGRAPHY_DEPTH:
            return (well) =>
                well.completions.find(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    (_, index) => well.completions[index]!.open > 0
                )?.zoneIndex;
        case SORT_BY_COMPLETION_DATE:
            return (well) => well.earliestCompDateIndex;
        default:
            return (well) => well.attributes[sortMethod];
    }
};
export const createSortFunction = (
    sortBy: Record<string, SortDirection>
): ((a: WellPlotData, b: WellPlotData) => 0 | 1 | -1) => {
    const keyFunctions = new Map(
        Object.keys(sortBy).map(
            (sort) =>
                [sort, createAttributeKeyFunction(sort)] as [
                    string,
                    (well: WellPlotData) => AttributeType
                ]
        )
    );
    return (a: WellPlotData, b: WellPlotData) => {
        for (const sort in sortBy) {
            const keyFunction = keyFunctions.get(sort) as (
                well: WellPlotData
            ) => string | number | undefined;
            const aAttribute = keyFunction(a);
            const bAttribute = keyFunction(b);
            if (aAttribute === bAttribute) continue;
            if (
                aAttribute === undefined ||
                bAttribute === undefined ||
                (sortBy[sort] === "Ascending" && aAttribute < bAttribute) ||
                (sortBy[sort] !== "Ascending" && aAttribute > bAttribute)
            )
                return -1;
            else return 1;
        }
        return 0;
    };
};
