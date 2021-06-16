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
            width: "200px",
            marginRight: theme.spacing(4),
        },
        dropdowns: {
            display: "flex",
            flexDirection: "row",
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
        (range) => dispatch(updateTimeIndexRange(range)),
        [dispatch]
    );
    //If number of time step is small
    return times.length <= 15 ? (
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
                onChange={(_, value) =>
                    onChange(
                        timeAggregation === "None"
                            ? [0, value]
                            : [
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
    ) : (
        <div className={classes.dropdowns}>
            {timeAggregation !== "None" && (
                <NativeSelect
                    className={classes.root}
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
            <NativeSelect
                className={classes.root}
                id="time-end-selector"
                label={timeAggregation === "None" ? "Select Time" : "End"}
                value={Math.max(...timeIndexRange)}
                onChange={(event) =>
                    onChange([timeIndexRange[0], parseInt(event.target.value)])
                }
            >
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
