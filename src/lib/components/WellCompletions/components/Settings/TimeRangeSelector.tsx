import {
    createStyles,
    makeStyles,
    Slider,
    Theme,
    // eslint-disable-next-line prettier/prettier
    withStyles
} from "@material-ui/core";
import { isEqual } from "lodash";
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
const EdsSlider = withStyles({
    root: {
        color: "#007079",
    },
    valueLabel: {
        top: 22,
        "& *": {
            background: "transparent",
            color: "#000",
        },
    },
})(Slider);
const TimeRangeSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    const data = useContext(DataContext);
    // Redux
    const dispatch = useDispatch();
    const timeAggregation = useSelector(
        (state: WellCompletionsState) => state.ui.timeAggregation
    );
    const timeIndexRange = useSelector(
        (state: WellCompletionsState) => state.ui.timeIndexRange,
        isEqual
    ) as [number, number];
    const times = useMemo(() => data.timeSteps, [data]);
    // handlers
    const outputFunction = useCallback((step: number) => times[step], [times]);
    const onChange = useCallback(
        (_, value) =>
            dispatch(
                updateTimeIndexRange(
                    timeAggregation === "None"
                        ? [0, value]
                        : [Math.min(...value), Math.max(...value)]
                )
            ),
        [dispatch, timeAggregation]
    );
    return (
        <div className={classes.root}>
            <span>Time Steps</span>
            <EdsSlider
                track={timeAggregation === "None" ? false : "normal"}
                aria-labelledby="time-step-slider-label"
                value={
                    timeAggregation === "None"
                        ? Math.max(...timeIndexRange)
                        : timeIndexRange.slice()
                }
                valueLabelDisplay="on"
                onChange={onChange}
                min={0}
                max={times.length - 1}
                step={1}
                marks={true}
                valueLabelFormat={outputFunction}
            />
        </div>
    );
});

TimeRangeSelector.displayName = "TimeRangeSelector";
export default TimeRangeSelector;
