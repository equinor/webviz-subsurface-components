import { NativeSelect } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import { Slider } from "@mui/material";
import { isEqual } from "lodash";
import React, { useCallback, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTimeIndexRange } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";
import { DataContext } from "../DataLoader";
const PREFIX = "TimeRangeSelector";

const classes = {
    root: `${PREFIX}-root`,
    valueLabel: `${PREFIX}-valueLabel`,
    slider: `${PREFIX}-slider`,
    selector: `${PREFIX}-selector`,
};

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.root}`]: {
        display: "flex",
        flexDirection: "row",
    },

    [`& .${classes.slider}`]: {
        width: "200px",
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(4),
    },

    [`& .${classes.selector}`]: {
        maxWidth: "130px",
    },
}));

const EdsSlider = styled(Slider)({
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
});

/**
 * A React component for selecting time step(s) to display in the plot
 */
const TimeRangeSelector: React.FC = React.memo(() => {
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
        (range: unknown) =>
            dispatch(updateTimeIndexRange(range as [number, number])),
        [dispatch]
    );

    // Render
    return (
        <Root className={classes.root}>
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
                    classes={{
                        root: classes.root,
                        valueLabel: classes.valueLabel,
                    }}
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
        </Root>
    );
});

TimeRangeSelector.displayName = "TimeRangeSelector";
export default TimeRangeSelector;
