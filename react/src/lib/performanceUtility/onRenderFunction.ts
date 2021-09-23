/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
//import logToDatabase from "./logPerformanceData";
// eslint-disable-next-line prefer-const
let plottable: any[] = [];
const logTimes = (
    id: any,
    phase: any,
    actualDuration: any,
    baseDuration: any
) => {
    // console.log(
    //     `${id}'s phase: ${phase}\nActual time: ${actualDuration} \nBase time: ${baseDuration}`
    // );
    plottable.push(id, phase, actualDuration, baseDuration);
    //console.log(plottable);
};
console.log("This is it =>", plottable);
export default logTimes;
