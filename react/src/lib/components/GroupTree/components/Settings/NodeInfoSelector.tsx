import { NativeSelect } from "@equinor/eds-core-react";
import { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentNodeInfo } from "../../redux/actions";
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
    node_options: DataInfos;
}

const NodeInfoSelector: React.FC<Props> = React.memo(
    ({ node_options }: Props) => {
        const classes = useStyles();
        // Redux
        const dispatch = useDispatch();
        const currentNodeInfo = useSelector(
            (st: GroupTreeState) => st.ui.currentNodeInfo
        );
        // handlers
        const handleSelectedItemChange = useCallback(
            (event) => {
                dispatch(updateCurrentNodeInfo(event.target.value));
            },
            [dispatch]
        );

        return (
            <NativeSelect
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
            </NativeSelect>
        );
    }
);

NodeInfoSelector.displayName = "NodeInfoSelector";
export default NodeInfoSelector;
