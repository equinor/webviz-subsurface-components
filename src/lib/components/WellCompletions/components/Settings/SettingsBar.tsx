import { TopBar } from "@equinor/eds-core-react";
import { createStyles, makeStyles } from "@material-ui/core";
import React from "react";
import FilterButton from "./FilterButton";
import TimeRangeSelector from "./TimeRangeSelector";
import ViewButton from "./ViewButton";

const useStyles = makeStyles(() =>
    createStyles({
        topBar: {
            minHeight: "90px",
        },
        actions: {
            position: "relative",
            display: "flex",
            flexDirection: "row",
        },
    })
);
/**
 * A settings bar that offers time selection and other viewing/filtering functions
 */
const SettingsBar: React.FC = React.memo(() => {
    const classes = useStyles();
    return (
        <TopBar className={classes.topBar}>
            <TopBar.Header className={classes.actions}>
                <TimeRangeSelector />
            </TopBar.Header>
            <TopBar.Actions className={classes.actions}>
                <ViewButton />
                <FilterButton />
            </TopBar.Actions>
        </TopBar>
    );
});

SettingsBar.displayName = "SettingsBar";
export default SettingsBar;
