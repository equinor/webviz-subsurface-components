import { Data } from "../../redux/types";

export const dataInTimeIndexRange = (
    data: Data,
    range: [number, number]
): WellPlotData[] => {
    const wellPlotData: WellPlotData[] = [];
    //Get first step for now
    data.wells.forEach(well => {
        const wellCompletions: number[] = [];
        let hasData = false;
        data.stratigraphy.forEach(zone => {
            if (well.completions[zone.name]) {
                hasData = true;
                //Find value at the index
                let value = 0;
                for (let i = 0; i < well.completions[zone.name].t.length; i++) {
                    if (range[0] < well.completions[zone.name].t[i]) {
                        break;
                    }
                    value = well.completions[zone.name].f[i];
                }
                wellCompletions.push(value);
            } else {
                wellCompletions.push(0);
            }
        });
        if (hasData)
            wellPlotData.push({
                name: well.name,
                completions: wellCompletions,
            });
    });

    return wellPlotData;
};

export interface WellPlotData {
    name: string;
    completions: number[];
}
