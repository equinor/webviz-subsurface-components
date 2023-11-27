import { NativeSelect } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentFlowRate } from "../../redux/actions";
import type { GroupTreeState } from "../../redux/store";
import { EdgeMetadata } from "@webviz/group-tree-plot";

const PREFIX = "FlowRateSelector";

const classes = {
    root: `${PREFIX}-root`,
};

const StyledNativeSelect = styled(NativeSelect)(({ theme }) => ({
    [`&.${classes.root}`]: {
        maxWidth: "250px",
        padding: theme.spacing(1),
    },
}));

interface FlowRateSelectorProps {
    edgeMetadataList: EdgeMetadata[];
}

const FlowRateSelector: React.FC<FlowRateSelectorProps> = React.memo(
    (props: FlowRateSelectorProps) => {
        // Redux
        const dispatch = useDispatch();
        const currentFlowRate = useSelector(
            (st: GroupTreeState) => st.ui.currentFlowRate
        );
        // handlers
        const handleSelectedItemChange = useCallback(
            (event: React.ChangeEvent<HTMLSelectElement>) => {
                dispatch(updateCurrentFlowRate(event.target.value));
            },
            [dispatch]
        );

        return (
            <StyledNativeSelect
                className={classes.root}
                id="flow-rate-selector"
                label="Flow Rate"
                value={currentFlowRate}
                onChange={handleSelectedItemChange}
            >
                {props.edgeMetadataList.map((metadata: EdgeMetadata) => (
                    <option key={`option-${metadata.key}`} value={metadata.key}>
                        {metadata.label}
                    </option>
                ))}
            </StyledNativeSelect>
        );
    }
);

FlowRateSelector.displayName = "FlowRateSelector";
export default FlowRateSelector;
