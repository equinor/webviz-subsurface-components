import { Slider } from "@equinor/eds-core-react";
import { createStyles, makeStyles } from "@material-ui/core";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTimeIndexRange, WellCompletionsState } from "../redux/reducer";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            margin: "2rem",
        },
    })
);
const TimeRangeSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    const times = useSelector((state: WellCompletionsState) => state.times);
    const timeIndexRange = useSelector(
        (state: WellCompletionsState) => state.timeIndexRange
    );
    // handlers
    const outputFunction = useCallback((step: number) => times[step], [times]);
    const onChange = useCallback(
        (event, value) => {
            console.log(value);
            dispatch(updateTimeIndexRange(value));
        },
        [dispatch]
    );
    //If data not loaded yet
    if (!timeIndexRange) return <div />;

    return (
        <div className={classes.root}>
            <Slider
                value={timeIndexRange}
                onChange={onChange}
                ariaLabelledby="range-slider-label"
                min={0}
                max={times.length - 1}
                step={1}
                outputFunction={outputFunction}
            />
        </div>
    );
});

TimeRangeSelector.displayName = "WellCompletions";
export default TimeRangeSelector;
