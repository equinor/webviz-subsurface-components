import {
    AttributeType,
    SortBy,
    SortDirection,
    WellPlotData,
} from "../../../../well-completions-plot/src";

// Default sort methods
export const createAttributeKeyFunction = (
    sortMethod: string
): ((well: WellPlotData) => AttributeType) => {
    switch (sortMethod) {
        case SortBy.Name:
            return (well) => well.name;
        case SortBy.StratigraphyDepth:
            return (well) =>
                well.completions.find(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    (_, index) => well.completions[index]!.open > 0
                )?.zoneIndex;
        case SortBy.CompletionDate:
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
                (sortBy[sort] === SortDirection.Ascending &&
                    aAttribute < bAttribute) ||
                (sortBy[sort] !== SortDirection.Ascending &&
                    aAttribute > bAttribute)
            )
                return -1;
            else return 1;
        }
        return 0;
    };
};
