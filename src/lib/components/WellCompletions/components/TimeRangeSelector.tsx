import { Slider } from "@equinor/eds-core-react";
import { createStyles, makeStyles } from "@material-ui/core";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTimeIndexRange } from "../redux/reducer";
import { WellCompletionsState } from "../redux/store";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            margin: "2rem",
            width: "30%",
        },
    })
);
const TimeRangeSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    const times = useSelector(
        (state: WellCompletionsState) => state.dataModel.data!.timeSteps
    );
    const timeIndexRange = useSelector(
        (state: WellCompletionsState) => state.ui.timeIndexRange
    );
    // handlers
    const outputFunction = useCallback(
        (step: number) => (times ? times[step] : ""),
        [times]
    );
    const onChange = useCallback(
        (_, value) => dispatch(updateTimeIndexRange(value)),
        [dispatch]
    );

    //If data not loaded yet
    if (!times) return <div />;

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
