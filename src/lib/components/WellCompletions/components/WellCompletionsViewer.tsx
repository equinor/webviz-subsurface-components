import { createStyles, makeStyles } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { WellCompletionsState } from "../redux/store";
import TimeRangeSelector from "./TimeRangeSelector";
import WellCompletionsPlot from "./WellCompletionsPlot/WellCompletionsPlot";

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
            <TimeRangeSelector />
            <WellCompletionsPlot />
        </div>
    );
};

WellCompletionsViewer.displayName = "WellCompletionsViewer";
export default WellCompletionsViewer;
