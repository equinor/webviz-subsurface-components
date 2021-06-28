import { NativeSelect } from "@equinor/eds-core-react";
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
            display: "flex",
            flexDirection: "row",
        },
        slider: {
            width: "200px",
            marginLeft: theme.spacing(4),
            marginRight: theme.spacing(4),
        },
        selector: {
            maxWidth: "130px",
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
/**
 * A React component for selecting time step(s) to display in the plot
 */
const TimeRangeSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    // Direct access to the input data
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

    // Memo
    // Arry of date time strings
    const times = useMemo(() => data.timeSteps, [data]);

    // Handlers
    // Get date time string by index
    const outputFunction = useCallback((step: number) => times[step], [times]);
    // Update time range in redux. When the time aggregation is off,
    // only the upper bound of the range will be used in computing the plot data
    const onChange = useCallback(
        (range) => dispatch(updateTimeIndexRange(range)),
        [dispatch]
    );

    // Render
    return (
        <div className={classes.root}>
            {/* This only appears when time aggregation is on */}
            {timeAggregation !== "None" && (
                <NativeSelect
                    className={classes.selector}
                    id="time-start-selector"
                    label="Start"
                    value={Math.min(...timeIndexRange)}
                    onChange={(event) =>
                        onChange([
                            parseInt(event.target.value),
                            Math.max(
                                parseInt(event.target.value),
                                timeIndexRange[1]
                            ),
                        ])
                    }
                >
                    {/* Show the full list of date times */}
                    {times.map((time, index) => (
                        <option
                            key={`time-dropdown-start-${time}`}
                            value={index}
                        >
                            {time}
                        </option>
                    ))}
                </NativeSelect>
            )}
            {/* Slider that is easy to use when the number of time steps is not too large */}
            <div className={classes.slider}>
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
                    onChange={(_, value) =>
                        onChange(
                            //If time aggregation is off, we only need to know the end date
                            timeAggregation === "None"
                                ? [0, value]
                                : // This is due to a feature (or a bug) in EdsSlider that the first
                                  //value in the range is not necessarily the lower bound
                                  [
                                      Math.min(...(value as number[])),
                                      Math.max(...(value as number[])),
                                  ]
                        )
                    }
                    min={0}
                    max={times.length - 1}
                    step={1}
                    marks={true}
                    valueLabelFormat={outputFunction}
                />
            </div>
            <NativeSelect
                className={classes.selector}
                id="time-end-selector"
                label={timeAggregation === "None" ? "Select Time" : "End"}
                value={Math.max(...timeIndexRange)}
                onChange={(event) =>
                    onChange([
                        timeAggregation === "None" ? 0 : timeIndexRange[0],
                        parseInt(event.target.value),
                    ])
                }
            >
                {/* If time aggregation is on, we only show the time steps that >= the start date */}
                {(timeAggregation === "None"
                    ? times
                    : times.filter(
                          (_, index) => index >= Math.min(...timeIndexRange)
                      )
                ).map((time, index) => (
                    <option
                        key={`time-dropdown-end-${time}`}
                        value={
                            index +
                            (timeAggregation === "None"
                                ? 0
                                : Math.min(...timeIndexRange))
                        }
                    >
                        {time}
                    </option>
                ))}
            </NativeSelect>
        </div>
    );
});

TimeRangeSelector.displayName = "TimeRangeSelector";
export default TimeRangeSelector;
