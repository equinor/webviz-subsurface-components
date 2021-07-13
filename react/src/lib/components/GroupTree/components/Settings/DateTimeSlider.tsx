import {
    createStyles,
    makeStyles,
    Slider,
    Theme,
    // eslint-disable-next-line prettier/prettier
    withStyles
} from "@material-ui/core";
import React, { useCallback, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentDateTime } from "../../redux/actions";
import { GroupTreeState } from "../../redux/store";
import { Data, DatedTree } from "../../redux/types";
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
const DateTimeSlider: React.FC = React.memo(() => {
    const classes = useStyles();
    const data: Data = useContext(DataContext);
    // Redux
    const dispatch = useDispatch();

    const currentDateTime = useSelector(
        (state: GroupTreeState) => state.ui.currentDateTime
    );

    const times = useMemo(
        // list of all dates
        () => {
            const times: string[] = data.reduce(
                (total: string[], currentValue: DatedTree) => {
                    return total.concat(currentValue.dates);
                },
                []
            );
            return times;
        },
        [data]
    );

    const currentDateTimeIndex = useMemo(
        () => times.indexOf(currentDateTime),
        [times, currentDateTime]
    );

    // handlers
    const outputFunction = useCallback((step: number) => times[step], [times]);
    const onChange = useCallback(
        (_, step) => dispatch(updateCurrentDateTime(times[step])),
        [dispatch, times]
    );
    return (
        <div className={classes.root}>
            <span>Time Steps</span>
            <EdsSlider
                track={false}
                aria-labelledby="date-time-slider-label"
                value={currentDateTimeIndex}
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

DateTimeSlider.displayName = "DateTimeSlider";
export default DateTimeSlider;
