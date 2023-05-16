import { NativeSelect } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import React, { ChangeEvent, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTimeAggregation } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";
import { TimeAggregations } from "../../redux/types";

const PREFIX = "TimeAggregationSelector";

const classes = {
    root: `${PREFIX}-root`,
};

const StyledNativeSelect = styled(NativeSelect)(({ theme }) => ({
    [`&.${classes.root}`]: {
        minWidth: "170px",
        maxWidth: "170px",
        padding: theme.spacing(1),
    },
}));

/**
 * A dropdown for selecting the time aggregation mode
 */
const TimeAggregationSelector: React.FC = React.memo(() => {
    // Redux
    const dispatch = useDispatch();
    const timeAggregation = useSelector(
        (st: WellCompletionsState) => st.ui.timeAggregation
    );
    // Handlers
    const handleSelectedItemChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) =>
            dispatch(updateTimeAggregation(event.target.value as any)),
        [dispatch]
    );
    //Render
    return (
        <StyledNativeSelect
            className={classes.root}
            id="time-aggregation-selector"
            label="Time Aggregation"
            value={timeAggregation}
            onChange={handleSelectedItemChange}
        >
            {Object.keys(TimeAggregations).map((mode) => (
                <option key={mode}>{mode}</option>
            ))}
        </StyledNativeSelect>
    );
});

TimeAggregationSelector.displayName = "TimeAggregationSelector";
export default TimeAggregationSelector;
