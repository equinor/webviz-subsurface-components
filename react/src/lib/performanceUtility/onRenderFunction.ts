const logTimes = (
    id: any,
    phase: any,
    actualDuration: any,
    baseDuration: any,
) => {
    console.log(
        `${id}'s phase: ${phase}\nActual time: ${actualDuration} \nBase time: ${baseDuration}`
    );
    //return[id, phase, actualDuration, baseDuration]
};

export default logTimes;