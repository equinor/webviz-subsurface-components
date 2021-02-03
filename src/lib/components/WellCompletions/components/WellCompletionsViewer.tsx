import { createStyles, makeStyles } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { WellCompletionsState } from "../redux/store";
import HideZeroCompletionsSwitch from "./Settings/HideZeroCompletionsSwitch";
import RangeDisplayModeSelector from "./Settings/RangeDisplayModeSelector";
import TimeRangeSelector from "./Settings/TimeRangeSelector";
import WellCompletionsPlot from "./Plot/WellCompletionsPlot";
import WellFilter from "./Settings/WellFilter";
import ZoneSelector from "./Settings/ZoneSelector";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            position: "relative",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            height: "90%",
            minWidth: "500px",
            minHeight: "300px",
        },
        actions: {
            position: "relative",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            margin: "2rem",
        },
    })
);

const WellCompletionsViewer: React.FC = () => {
    const classes = useStyles();
    const data = useSelector(
        (state: WellCompletionsState) => state.dataModel.data
    );
    //If no data is available
    if (!data) return <div />;
    return (
        <div className={classes.root}>
            <div className={classes.actions}>
                <TimeRangeSelector />
                <RangeDisplayModeSelector />
                <HideZeroCompletionsSwitch />
                <ZoneSelector />
                <WellFilter />
            </div>
            <WellCompletionsPlot />
        </div>
    );
};

WellCompletionsViewer.displayName = "WellCompletionsViewer";
export default WellCompletionsViewer;
