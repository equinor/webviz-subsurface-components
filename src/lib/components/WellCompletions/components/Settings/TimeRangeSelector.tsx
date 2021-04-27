import { Slider } from "@equinor/eds-core-react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { debounce, isEqual } from "lodash";
import React, { useCallback, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTimeIndexRange } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";
import { DataContext } from "../DataLoader";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: "200px",
            marginRight: theme.spacing(4),
        },
    })
);
const TimeRangeSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    const data = useContext(DataContext);
    // Redux
    const dispatch = useDispatch();
    const timeIndexRange = useSelector(
        (state: WellCompletionsState) => state.ui.timeIndexRange,
        isEqual
    );
    const times = useMemo(() => data.timeSteps, [data]);
    // handlers
    const outputFunction = useCallback(
        (step: number) => (times ? times[step] : ""),
        [times]
    );
    const onChange = useCallback(
        debounce(
            (_, value) =>
                dispatch(
                    updateTimeIndexRange([
                        Math.min(...value),
                        Math.max(...value),
                    ])
                ),
            20,
            {
                trailing: true,
            }
        ),
        [dispatch]
    );

    //If data not loaded yet
    if (!times) return <div />;

    return (
        <div className={classes.root}>
            <span>Time Steps</span>
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

TimeRangeSelector.displayName = "TimeRangeSelector";
export default TimeRangeSelector;
