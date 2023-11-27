import { NativeSelect } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentNodeInfo } from "../../redux/actions";
import type { GroupTreeState } from "../../redux/store";
import { NodeMetadata } from "../../../../group-tree-plot/src/types";

const PREFIX = "NodeInfoSelector";

const classes = {
    root: `${PREFIX}-root`,
};

const StyledNativeSelect = styled(NativeSelect)(({ theme }) => ({
    [`&.${classes.root}`]: {
        maxWidth: "250px",
        padding: theme.spacing(1),
    },
}));

interface NodeInfoSelectorProps {
    nodeMetadataList: NodeMetadata[];
}

const NodeInfoSelector: React.FC<NodeInfoSelectorProps> = React.memo(
    (props: NodeInfoSelectorProps) => {
        // Redux
        const dispatch = useDispatch();
        const currentNodeInfo = useSelector(
            (st: GroupTreeState) => st.ui.currentNodeInfo
        );
        // handlers
        const handleSelectedItemChange = useCallback(
            (event: React.ChangeEvent<HTMLSelectElement>) => {
                dispatch(updateCurrentNodeInfo(event.target.value as string));
            },
            [dispatch]
        );

        return (
            <StyledNativeSelect
                className={classes.root}
                id="node-info-selector"
                label="Node Data"
                value={currentNodeInfo}
                onChange={handleSelectedItemChange}
            >
                {props.nodeMetadataList.map((metadata: NodeMetadata) => (
                    <option key={`option-${metadata.key}`} value={metadata.key}>
                        {metadata.label}
                    </option>
                ))}
            </StyledNativeSelect>
        );
    }
);

NodeInfoSelector.displayName = "NodeInfoSelector";
export default NodeInfoSelector;
