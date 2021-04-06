import { RangeMode, RangeModes, Well, Zone } from "../redux/types";
export const preprocessData = (data: any) => {
    return {
        ...data,
        wells: data.wells.map((well) => {
            let earliestCompDateIndex = Number.POSITIVE_INFINITY;
            data.stratigraphy.forEach((zone) => {
                if (zone.name in well.completions) {
                    //store earliest completion date
                    const completion = well.completions[zone.name];
                    const earliestDate = completion.t.find(
                        (_, index) => completion.f[index] > 0
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
        const wellCompletions: number[] = [];
        const zoneIndices: number[] = [];
        let hasData = false;
        stratigraphy.forEach((zone, zoneIndex) => {
            const values = Array(range[1] - range[0] + 1).fill(0);
            if (zone.name in well.completions) {
                const completion = well.completions[zone.name];
                //Find values in the time range
                let index = 0;
                let currentValue = 0;
                for (let rangeI = 0; rangeI < values.length; rangeI++) {
                    const timeStep = rangeI + range[0];
                    while (timeStep >= completion.t[index]) {
                        currentValue = completion.f[index];
                        index++;
                    }
                    values[rangeI] = currentValue;
                }
            }
            const dFunction = RangeModes[rangeDisplayMode];
            const valueInRangeMode = dFunction(values);
            if (valueInRangeMode !== 0) hasData = true;
            //If value changed
            if (
                wellCompletions.length === 0 ||
                wellCompletions[wellCompletions.length - 1] !== valueInRangeMode
            ) {
                wellCompletions.push(valueInRangeMode);
                zoneIndices.push(zoneIndex);
            }
        });
        if (!hideZeroCompletions || hasData)
            wellPlotData.push({
                ...well,
                completions: wellCompletions,
                zoneIndices,
            });
    });
    return {
        stratigraphy,
        wells: wellPlotData,
    };
};

export interface PlotData {
    stratigraphy: Zone[];
    wells: WellPlotData[];
}
export interface WellPlotData {
    name: string;
    earliestCompDateIndex: number;
    attributes: Record<string, any>;
    completions: number[];
    zoneIndices: number[];
}
