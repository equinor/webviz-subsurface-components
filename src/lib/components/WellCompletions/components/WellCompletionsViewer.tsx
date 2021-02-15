import { createStyles, makeStyles } from "@material-ui/core";
import React, { useContext, useMemo } from "react";
import { usePlotData } from "../hooks/usePlotData";
import { DataContext } from "../WellCompletions";
import WellCompletionsPlot from "./Plot/WellCompletionsPlot";
import HideZeroCompletionsSwitch from "./Settings/HideZeroCompletionsSwitch";
import RangeDisplayModeSelector from "./Settings/RangeDisplayModeSelector";
import TimeRangeSelector from "./Settings/TimeRangeSelector";
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
        },
        actions: {
            position: "relative",
            display: "flex",
            flexDirection: "row",
            margin: "2rem",
        },
    })
);

const WellCompletionsViewer: React.FC = () => {
    const classes = useStyles();
    const data = useContext(DataContext);
    const plotData = usePlotData();

    const [minWidth, minHeight] = useMemo(
        () => [plotData.wells.length * 20, plotData.stratigraphy.length * 20],
        [plotData]
    );
    //If no data is available
    if (!data) return <div />;
    return (
        <div
            className={classes.root}
            style={{
                minWidth: `${minWidth}px`,
                minHeight: `${minHeight}px`,
            }}
        >
            <div className={classes.actions}>
                <TimeRangeSelector />
                <RangeDisplayModeSelector />
                <HideZeroCompletionsSwitch />
                <ZoneSelector />
                <WellFilter />
            </div>
            <WellCompletionsPlot plotData={plotData} />
        </div>
    );
};

WellCompletionsViewer.displayName = "WellCompletionsViewer";
export default WellCompletionsViewer;
