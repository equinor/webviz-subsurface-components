import { createStyles, makeStyles } from "@material-ui/core";
import React, { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { usePlotData } from "../hooks/usePlotData";
import { WellCompletionsState } from "../redux/store";
import { DataContext } from "./DataLoader";
import WellCompletionsPlot from "./Plot/WellCompletionsPlot";
import SettingsBar from "./Settings/SettingsBar";
import WellPagination from "./Settings/WellPagination";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            position: "relative",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            height: "90%",
        },
    })
);

const WellCompletionsViewer: React.FC = () => {
    const classes = useStyles();
    const data = useContext(DataContext);
    const plotData = usePlotData();

    const wellsPerPage = useSelector(
        (state: WellCompletionsState) => state.ui.wellsPerPage
    );
    const currentPage = useSelector(
        (state: WellCompletionsState) => state.ui.currentPage
    );
    const dataInCurrentPage = useMemo(() => {
        return {
            ...plotData,
            wells: plotData.wells.slice(
                (currentPage - 1) * wellsPerPage,
                currentPage * wellsPerPage - 1
            ),
        };
    }, [plotData, currentPage, wellsPerPage]);
    const [minWidth, minHeight] = useMemo(
        () => [
            dataInCurrentPage.wells.length * 20,
            dataInCurrentPage.stratigraphy.length * 20,
        ],
        [dataInCurrentPage]
    );
    //If no data is available
    if (!data) return <div />;
    return (
        <div className={classes.root}>
            <SettingsBar />
            <WellPagination />
            <div
                className={classes.root}
                style={{
                    minWidth: `${minWidth}px`,
                    minHeight: `${minHeight}px`,
                }}
            >
                <WellCompletionsPlot
                    timeSteps={data.timeSteps}
                    plotData={dataInCurrentPage}
                />
            </div>
        </div>
    );
};

WellCompletionsViewer.displayName = "WellCompletionsViewer";
export default WellCompletionsViewer;
