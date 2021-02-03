import { RangeMode, RangeModes, Well, Zone } from "../../redux/types";
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
    wells.forEach(well => {
        const wellCompletions: number[] = [];
        let hasData = false;
        stratigraphy.forEach(zone => {
            const values = Array(range[1] - range[0] + 1).fill(0);
            if (well.completions[zone.name]) {
                //Find values in the time range
                let index = 0;
                let currentValue = 0;
                for (let rangeI = 0; rangeI < values.length; rangeI++) {
                    while (
                        rangeI + range[0] >=
                        well.completions[zone.name].t[index]
                    ) {
                        currentValue = well.completions[zone.name].f[index];
                        index++;
                    }
                    values[rangeI] = currentValue;
                }
            }
            const dFunction = RangeModes[rangeDisplayMode];
            const valueInRangeMode = dFunction(values);
            if (valueInRangeMode !== 0) hasData = true;
            wellCompletions.push(valueInRangeMode);
        });
        if (!hideZeroCompletions || hasData)
            wellPlotData.push({
                name: well.name,
                completions: wellCompletions,
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
    completions: number[];
}
