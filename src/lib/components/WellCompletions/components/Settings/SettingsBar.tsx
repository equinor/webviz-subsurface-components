import { TopBar } from "@equinor/eds-core-react";
import { createStyles, makeStyles } from "@material-ui/core";
import React from "react";
import FilterMenu from "./FilterMenu";
import TimeRangeSelector from "./TimeRangeSelector";
import ViewMenu from "./ViewMenu";

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
const SettingsBar: React.FC = React.memo(() => {
    const classes = useStyles();
    return (
        <TopBar className={classes.topBar}>
            <TopBar.Header className={classes.actions}>
                <TimeRangeSelector />
            </TopBar.Header>
            <TopBar.Actions className={classes.actions}>
                <ViewMenu />
                <FilterMenu />
            </TopBar.Actions>
        </TopBar>
    );
});

SettingsBar.displayName = "SettingsBar";
export default SettingsBar;
