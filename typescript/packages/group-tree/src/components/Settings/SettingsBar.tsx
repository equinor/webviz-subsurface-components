import { TopBar } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import React from "react";
import DateTimeSlider from "./DateTimeSlider";
import FlowRateSelector from "./FlowRateSelector";
import NodeInfoSelector from "./NodeInfoSelector";
import { EdgeInfo, NodeInfo } from "../group-tree-plot/src/types";

const PREFIX = "SettingsBar";

const classes = {
    topBar: `${PREFIX}-topBar`,
    actions: `${PREFIX}-actions`,
};

const StyledTopBar = styled(TopBar)(() => ({
    [`&.${classes.topBar}`]: {
        minHeight: "90px",
    },

    [`& .${classes.actions}`]: {
        position: "relative",
        display: "flex",
        flexDirection: "row",
    },
}));

interface Props {
    edge_options: EdgeInfo[];
    node_options: NodeInfo[];
}

const SettingsBar: React.FC<Props> = React.memo(
    ({ edge_options, node_options }: Props) => {
        return (
            <StyledTopBar className={classes.topBar}>
                <TopBar.Header className={classes.actions}>
                    <FlowRateSelector edge_options={edge_options} />
                    <NodeInfoSelector node_options={node_options} />
                </TopBar.Header>
                <TopBar.Actions className={classes.actions}>
                    <DateTimeSlider />
                </TopBar.Actions>
            </StyledTopBar>
        );
    }
);

SettingsBar.displayName = "SettingsBar";
export default SettingsBar;
