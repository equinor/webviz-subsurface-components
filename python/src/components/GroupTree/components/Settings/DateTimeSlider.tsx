import { Slider } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useCallback, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentDateTime } from "../../redux/actions";
import type { GroupTreeState } from "../../redux/store";
import { DataContext } from "../DataLoader";

import { DatedTree, DatedTrees } from "@webviz/group-tree-plot";

import "./date_time_slider.css";

const classes = {
    root: "DateTimeSlider-root",
};

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.root}`]: {
        width: "200px",
        marginRight: theme.spacing(4),
    },
}));

const EdsSlider = styled(Slider)(() => ({
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
}));

const DateTimeSlider: React.FC = React.memo(() => {
    const data: DatedTrees = useContext(DataContext);
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
        (_: Event, step: number | number[]) => {
            if (typeof step === "number") {
                dispatch(updateCurrentDateTime(times[step]));
            }
        },
        [dispatch, times]
    );
    return (
        <Root className={classes.root}>
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
        </Root>
    );
});

DateTimeSlider.displayName = "DateTimeSlider";
export default DateTimeSlider;
