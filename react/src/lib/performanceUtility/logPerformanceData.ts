const logToDatabase = (
    id: any,
    phase: any,
    actualDuration: any,
    baseDuration: any
) => {
    console.log(
        `${id}'s phase: ${phase}\nActual time: ${actualDuration} \nBase time: ${baseDuration}`
    );
};

export default logToDatabase;
