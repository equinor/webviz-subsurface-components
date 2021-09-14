import { NativeSelect } from "@equinor/eds-core-react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentFlowRate } from "../../redux/actions";
import { GroupTreeState } from "../../redux/store";
import { EdgeOptions, EdgeOption } from "../../redux/types";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            minWidth: "170px",
            maxWidth: "170px",
            padding: theme.spacing(1),
        },
    })
);

interface Props {
    edge_options: EdgeOptions;
}

const FlowRateSelector: React.FC<Props> = React.memo(
    ({ edge_options }: Props) => {
        const classes = useStyles();
        // Redux
        const dispatch = useDispatch();
        let currentFlowRate = useSelector(
            (st: GroupTreeState) => st.ui.currentFlowRate
        );
        // handlers
        const handleSelectedItemChange = useCallback(
            (event) => dispatch(updateCurrentFlowRate(event.target.value)),
            [dispatch]
        );

        // If currentFlowRate is not contained in options use first option.
        if (!edge_options.some((e: EdgeOption) => e.name === currentFlowRate)) {
            currentFlowRate = edge_options[0].label;
        }

        return (
            <NativeSelect
                className={classes.root}
                id="flow-rate-selector"
                label="Flow Rate"
                value={currentFlowRate}
                onChange={handleSelectedItemChange}
            >
                {edge_options.map((key: EdgeOption) => (
                    <option key={`option-${key.name}`} value={key.name}>
                        {key.name}
                    </option>
                ))}
            </NativeSelect>
        );
    }
);

FlowRateSelector.displayName = "FlowRateSelector";
export default FlowRateSelector;
