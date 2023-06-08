import {
    AttributeType,
    Data,
    TimeAggregation,
    TimeAggregations,
    Well,
    WellInfo,
    // eslint-disable-next-line prettier/prettier
    Zone
} from "../redux/types";

/**
 * Preprocess the input data by finding the earliest completion date
 * @param data
 * @returns
 */
export const preprocessData = (subzones: string[], data: Data): Data => {
    return {
        ...data,
        wells: data.wells.map((well) => {
            //The earliest completion date for the given well
            let earliestCompDateIndex = Number.POSITIVE_INFINITY;
            subzones.forEach((zone) => {
                if (zone in well.completions) {
                    const completion = well.completions[zone];
                    //Find the earliest date for the given completion
                    const earliestDate = completion.t.find(
                        (_, index) => completion.open[index] > 0
                    );
                    if (earliestDate !== undefined)
                        earliestCompDateIndex = Math.min(
                            earliestCompDateIndex,
                            earliestDate
                        );
                }
            });
            //store the earliest completion date
            return { ...well, earliestCompDateIndex };
        }),
    };
};
export interface AttributeNode {
    name: string;
    children: { name: AttributeType; key: string }[];
}

/**
 * Extract well attributes into a tree structure for the use of node selector
 * @param wells
 * @param attributeKeys
 * @returns
 */
export const extractAttributesTree = (
    wells: WellInfo[],
    attributeKeys: string[]
): AttributeNode[] => {
    //Store unique attribute values in sets
    const attributes = new Map<string, Set<AttributeType>>(
        attributeKeys.map((key) => [key, new Set<AttributeType>()])
    );

    wells.forEach((well) =>
        attributes.forEach((valuesSet, key) =>
            //If the well doesnt have the given attribute key, it means the attribute is undefined for this well
            valuesSet.add(
                key in well.attributes ? well.attributes[key] : "undefined"
            )
        )
    );
    //Return an array of nodes
    return Array.from(attributes.entries()).map(([key, values]) => ({
        name: key,
        children: Array.from(values)
            .sort()
            .map((value) => ({
                name: value,
                key: `${key}-${value}`,
            })),
    }));
};
/**
 * Compute the selected nodes from the node selector into a map of attribute keys with their allowed values
 * @param filterByAttributes an array of selected node, e.g ["name:Ann","age:37"]
 * @returns
 */
export const computeAllowedAttributeValues = (
    filterByAttributes: string[]
): Map<string, Set<string>> => {
    const allowValues = new Map<string, Set<string>>();
    filterByAttributes.forEach((attributeNode) => {
        const [key, value] = attributeNode.split(":");
        if (!allowValues.has(key)) allowValues.set(key, new Set());
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        allowValues.get(key)!.add(value);
    });
    return allowValues;
};
/**
 * Create a attribute predicate for well selection
 * @param filterByAttributes an array of selected node, e.g ["name:Ann","age:37"]
 * @returns
 */
export const createAttributePredicate = (
    filterByAttributes: string[]
): ((well: Well) => boolean) => {
    const allowedValues = computeAllowedAttributeValues(filterByAttributes);
    // Use an OR logic for the attribute values under a given attribute key
    const filters = Array.from(allowedValues.entries()).map(([key, values]) => {
        return (well: Well) =>
            Array.from(values).some((value) => {
                const attributeType = typeof well.attributes[key];
                switch (attributeType) {
                    case "undefined":
                        return value === "undefined";
                    case "string":
                        return well.attributes[key] === value;
                    case "number":
                        return well.attributes[key] === +value;
                    case "boolean":
                        return well.attributes[key] === (value == "true");
                    default:
                        return false;
                }
            });
    });
    //Use an AND logic between different attribute keys
    return (well: Well) => {
        return filters.every((filter) => filter(well));
    };
};

/**
 * DFS to find all leaf nodes
 * @param zone
 * @param result
 * @returns
 */
export const findSubzones = (zone: Zone, result: Zone[]): void => {
    if (zone === undefined) return;
    if (zone.subzones === undefined || zone.subzones.length === 0)
        result.push(zone);
    else zone.subzones.forEach((zone) => findSubzones(zone, result));
};
/**
 * Util method to prepare stratigraphy and well data from the given time step range and other settings for plotting
 * @param subzones
 * @param wells
 * @param range
 * @param timeAggregation
 * @param hideZeroCompletions
 * @returns
 */
export const computeDataToPlot = (
    subzones: Zone[],
    wells: Well[],
    range: [number, number],
    timeAggregation: TimeAggregation,
    hideZeroCompletions: boolean
): PlotData => {
    const wellPlotData: WellPlotData[] = [];
    wells.forEach((well) => {
        const completionsPlotData: CompletionPlotData[] = [];
        let hasData = false;
        subzones.forEach((zone, zoneIndex) => {
            const length = range[1] - range[0] + 1;
            const openValues = Array(length).fill(0);
            const shutValues = Array(length).fill(0);
            const khMeanValues = Array(length).fill(0);
            const khMinValues = Array(length).fill(0);
            const khMaxValues = Array(length).fill(0);
            if (zone.name in well.completions) {
                const completion = well.completions[zone.name];
                //Find values in the time range
                let index = 0;
                let currentOpenValue = 0;
                let currentShutValue = 0;
                let currentkhMeanValue = 0;
                let currentkhMinValue = 0;
                let currentkhMaxValue = 0;
                for (let rangeI = 0; rangeI < length; rangeI++) {
                    const timeStep = rangeI + range[0];
                    while (timeStep >= completion.t[index]) {
                        currentOpenValue = completion.open[index];
                        currentShutValue = completion.shut[index];
                        currentkhMeanValue = completion.khMean[index];
                        currentkhMinValue = completion.khMin[index];
                        currentkhMaxValue = completion.khMax[index];
                        index++;
                    }
                    openValues[rangeI] = currentOpenValue;
                    shutValues[rangeI] = currentShutValue;
                    khMeanValues[rangeI] = currentkhMeanValue;
                    khMinValues[rangeI] = currentkhMinValue;
                    khMaxValues[rangeI] = currentkhMaxValue;
                }
            }
            const dFunction = TimeAggregations[timeAggregation];
            const newCompletion = {
                zoneIndex,
                open: dFunction(openValues),
                shut: dFunction(shutValues),
                khMean: dFunction(khMeanValues),
                khMin: dFunction(khMinValues),
                khMax: dFunction(khMaxValues),
            };
            if (newCompletion.open !== 0) hasData = true;
            //If value changed
            if (
                completionsPlotData.length === 0 ||
                !isCompletionValuesEqual(
                    completionsPlotData[completionsPlotData.length - 1],
                    newCompletion
                )
            ) {
                completionsPlotData.push(newCompletion);
            }
        });
        if (!hideZeroCompletions || hasData)
            wellPlotData.push({
                ...well,
                completions: completionsPlotData,
            });
    });
    return {
        stratigraphy: subzones,
        wells: wellPlotData,
    };
};

const isCompletionValuesEqual = (
    completion1: CompletionPlotData,
    completion2: CompletionPlotData
) =>
    completion1.open === completion2.open &&
    completion1.shut === completion2.shut &&
    completion1.khMean === completion2.khMean &&
    completion1.khMin === completion2.khMin &&
    completion1.khMax === completion2.khMax;

export interface PlotData {
    stratigraphy: Zone[];
    wells: WellPlotData[];
}
export interface WellPlotData extends WellInfo {
    completions: CompletionPlotData[];
}

export interface CompletionPlotData {
    zoneIndex: number;
    open: number;
    shut: number;
    khMean: number;
    khMin: number;
    khMax: number;
}
