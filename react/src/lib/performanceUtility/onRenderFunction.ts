/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
//import logToDatabase from "./logPerformanceData";
const plottable: any[] = [];

const logTimes = (
    id: any,
    phase: any,
    actualDuration: any,
    baseDuration: any
) => {
    console.log(
        `${id}'s phase: ${phase}\nActual time: ${actualDuration} \nBase time: ${baseDuration}`
    );
    plottable.push(id, phase, actualDuration, baseDuration);
    //console.log(plottable);
    //logToDatabase(plottable);
};

export default logTimes;
export const obj = {
    plottable,
};
