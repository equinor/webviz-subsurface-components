import { NativeSelect } from "@equinor/eds-core-react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentFlowRate } from "../../redux/actions";
import { GroupTreeState } from "../../redux/store";
import { FlowRates } from "../../redux/types";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            minWidth: "170px",
            maxWidth: "170px",
            padding: theme.spacing(1),
        },
    })
);

const FlowRateSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    const currentFlowRate = useSelector(
        (st: GroupTreeState) => st.ui.currentFlowRate
    );
    // handlers
    const handleSelectedItemChange = useCallback(
        (event) => dispatch(updateCurrentFlowRate(event.target.value)),
        [dispatch]
    );
    return (
        <NativeSelect
            className={classes.root}
            id="flow-rate-selector"
            label="Flow Rate"
            value={currentFlowRate}
            onChange={handleSelectedItemChange}
        >
            {Object.keys(FlowRates).map((rate) => (
                <option key={`option-${rate}`} value={rate}>
                    {FlowRates[rate]}
                </option>
            ))}
        </NativeSelect>
    );
});

FlowRateSelector.displayName = "FlowRateSelector";
export default FlowRateSelector;
