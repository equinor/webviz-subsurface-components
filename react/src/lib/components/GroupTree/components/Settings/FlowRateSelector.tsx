import { NativeSelect } from "@equinor/eds-core-react";
import { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentFlowRate } from "../../redux/actions";
import { GroupTreeState } from "../../redux/store";
import { DataInfos, DataInfo } from "../../redux/types";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            maxWidth: "250px",
            padding: theme.spacing(1),
        },
    })
);

interface Props {
    edge_options: DataInfos;
}

const FlowRateSelector: React.FC<Props> = React.memo(
    ({ edge_options }: Props) => {
        const classes = useStyles();
        // Redux
        const dispatch = useDispatch();
        const currentFlowRate = useSelector(
            (st: GroupTreeState) => st.ui.currentFlowRate
        );
        // handlers
        const handleSelectedItemChange = useCallback(
            (event) => {
                dispatch(updateCurrentFlowRate(event.target.value));
            },
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
                {edge_options.map((key: DataInfo) => (
                    <option key={`option-${key.name}`} value={key.name}>
                        {key.label}
                    </option>
                ))}
            </NativeSelect>
        );
    }
);

FlowRateSelector.displayName = "FlowRateSelector";
export default FlowRateSelector;
