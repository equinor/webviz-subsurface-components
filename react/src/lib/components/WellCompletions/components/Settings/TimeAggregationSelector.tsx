import { NativeSelect } from "@equinor/eds-core-react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTimeAggregation } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";
import { TimeAggregations } from "../../redux/types";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            minWidth: "170px",
            maxWidth: "170px",
            padding: theme.spacing(1),
        },
    })
);
/**
 * A dropdown for selecting the time aggregation mode
 */
const TimeAggregationSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    const timeAggregation = useSelector(
        (st: WellCompletionsState) => st.ui.timeAggregation
    );
    // Handlers
    const handleSelectedItemChange = useCallback(
        (event) => dispatch(updateTimeAggregation(event.target.value)),
        [dispatch]
    );
    //Render
    return (
        <NativeSelect
            className={classes.root}
            id="time-aggregation-selector"
            label="Time Aggregation"
            value={timeAggregation}
            onChange={handleSelectedItemChange}
        >
            {Object.keys(TimeAggregations).map((mode) => (
                <option key={mode}>{mode}</option>
            ))}
        </NativeSelect>
    );
});

TimeAggregationSelector.displayName = "TimeAggregationSelector";
export default TimeAggregationSelector;
