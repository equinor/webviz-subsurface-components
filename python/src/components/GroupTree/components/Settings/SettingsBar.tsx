import { TopBar } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import React from "react";
import DateTimeSlider from "./DateTimeSlider";
import FlowRateSelector from "./FlowRateSelector";
import NodeInfoSelector from "./NodeInfoSelector";
import { EdgeMetadata, NodeMetadata } from "@webviz/group-tree-plot";

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

interface SettingsBarProps {
    edgeMetadataList: EdgeMetadata[];
    nodeMetadataList: NodeMetadata[];
}

const SettingsBar: React.FC<SettingsBarProps> = React.memo(
    (props: SettingsBarProps) => {
        return (
            <StyledTopBar className={classes.topBar}>
                <TopBar.Header className={classes.actions}>
                    <FlowRateSelector
                        edgeMetadataList={props.edgeMetadataList}
                    />
                    <NodeInfoSelector
                        nodeMetadataList={props.nodeMetadataList}
                    />
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
