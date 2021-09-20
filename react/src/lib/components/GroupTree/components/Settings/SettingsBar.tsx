import { TopBar } from "@equinor/eds-core-react";
import { createStyles, makeStyles } from "@material-ui/core";
import React from "react";
import DateTimeSlider from "./DateTimeSlider";
import FlowRateSelector from "./FlowRateSelector";
import { EdgeOptions } from "../../redux/types";

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

interface Props {
    edge_options: EdgeOptions;
}

const SettingsBar: React.FC<Props> = React.memo(({ edge_options }: Props) => {
    const classes = useStyles();
    return (
        <TopBar className={classes.topBar}>
            <TopBar.Header className={classes.actions}>
                <FlowRateSelector edge_options={edge_options} />
            </TopBar.Header>
            <TopBar.Actions className={classes.actions}>
                <DateTimeSlider />
            </TopBar.Actions>
        </TopBar>
    );
});

SettingsBar.displayName = "SettingsBar";
export default SettingsBar;
