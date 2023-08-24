/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const perf_metrics: any[] = [];

const logTimes = (
    id: any,
    phase: any,
    actualDuration: any,
    baseDuration: any
) => {
    console.log(
        `${id}'s phase: ${phase}\nActual time: ${actualDuration} \nBase time: ${baseDuration}`
    );
    perf_metrics.push([id, phase, actualDuration, baseDuration]);
};

export default logTimes;
export const obj = {
    perf_metrics,
};
