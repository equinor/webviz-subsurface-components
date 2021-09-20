import logToDatabase from "./logPerformanceData";
const logTimes = (
    id: any,
    phase: any,
    actualDuration: any,
    baseDuration: any,
) => {
    // console.log(
    //     `${id}'s phase: ${phase}\nActual time: ${actualDuration} \nBase time: ${baseDuration}`
    // );
    logToDatabase(id,
        phase,
        actualDuration,
        baseDuration)
};

export default logTimes;
