import { Data, RangeMode, RangeModes, Well, Zone } from "../redux/types";
export const preprocessData = (data: Data): Data => {
    return {
        ...data,
        wells: data.wells.map((well) => {
            let earliestCompDateIndex = Number.POSITIVE_INFINITY;
            data.stratigraphy.forEach((zone) => {
                if (zone.name in well.completions) {
                    //store earliest completion date
                    const completion = well.completions[zone.name];
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
            return { ...well, earliestCompDateIndex };
        }),
    };
};

/**
 * Util method to prepare stratigraphy and well data from the given time step range and other settings for plotting
 * @param stratigraphy
 * @param wells
 * @param range
 * @param rangeDisplayMode
 * @param hideZeroCompletions
 * @returns
 */
export const dataInTimeIndexRange = (
    stratigraphy: Zone[],
    wells: Well[],
    range: [number, number],
    rangeDisplayMode: RangeMode,
    hideZeroCompletions: boolean
): PlotData => {
    const wellPlotData: WellPlotData[] = [];
    //Get first step for now
    wells.forEach((well) => {
        const completionsPlotData: CompletionPlotData[] = [];
        let hasData = false;
        stratigraphy.forEach((zone, zoneIndex) => {
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
            const dFunction = RangeModes[rangeDisplayMode];
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
        stratigraphy,
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
export interface WellPlotData {
    name: string;
    earliestCompDateIndex: number;
    attributes: Record<string, string | number | undefined>;
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
