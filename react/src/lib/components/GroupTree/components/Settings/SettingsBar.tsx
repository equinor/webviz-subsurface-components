import { TopBar } from "@equinor/eds-core-react";
import { createStyles, makeStyles } from "@material-ui/core";
import React from "react";
import DateTimeSlider from "./DateTimeSlider";
import FlowRateSelector from "./FlowRateSelector";

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
                <FlowRateSelector />
            </TopBar.Header>
            <TopBar.Actions className={classes.actions}>
                <DateTimeSlider />
            </TopBar.Actions>
        </TopBar>
    );
});

SettingsBar.displayName = "SettingsBar";
export default SettingsBar;
