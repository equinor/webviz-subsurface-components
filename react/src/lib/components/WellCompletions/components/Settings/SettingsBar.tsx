import { TopBar } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import React from "react";
import FilterButton from "./FilterButton";
import TimeRangeSelector from "./TimeRangeSelector";
import ViewButton from "./ViewButton";

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

/**
 * A settings bar that offers time selection and other viewing/filtering functions
 */
const SettingsBar: React.FC = React.memo(() => {
    return (
        <StyledTopBar className={classes.topBar}>
            <TopBar.Header className={classes.actions}>
                <TimeRangeSelector />
            </TopBar.Header>
            <TopBar.Actions className={classes.actions}>
                <ViewButton />
                <FilterButton />
            </TopBar.Actions>
        </StyledTopBar>
    );
});

SettingsBar.displayName = "SettingsBar";
export default SettingsBar;
