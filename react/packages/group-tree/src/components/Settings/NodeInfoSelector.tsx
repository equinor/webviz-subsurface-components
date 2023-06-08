import { NativeSelect } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentNodeInfo } from "../../redux/actions";
import { GroupTreeState } from "../../redux/store";
import { DataInfos, DataInfo } from "../../redux/types";

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

interface Props {
    node_options: DataInfos;
}

const NodeInfoSelector: React.FC<Props> = React.memo(
    ({ node_options }: Props) => {
        // Redux
        const dispatch = useDispatch();
        const currentNodeInfo = useSelector(
            (st: GroupTreeState) => st.ui.currentNodeInfo
        );
        // handlers
        const handleSelectedItemChange = useCallback(
            (event: { target: { value: unknown } }) => {
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
                {node_options.map((key: DataInfo) => (
                    <option key={`option-${key.name}`} value={key.name}>
                        {key.label}
                    </option>
                ))}
            </StyledNativeSelect>
        );
    }
);

NodeInfoSelector.displayName = "NodeInfoSelector";
export default NodeInfoSelector;
