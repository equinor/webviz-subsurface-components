import { TopBar } from "@equinor/eds-core-react";
import { createStyles, makeStyles } from "@material-ui/core";
import React, { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { usePlotData } from "../hooks/usePlotData";
import { WellCompletionsState } from "../redux/store";
import { DataContext } from "../WellCompletions";
import WellCompletionsPlot from "./Plot/WellCompletionsPlot";
import HideZeroCompletionsSwitch from "./Settings/HideZeroCompletionsSwitch";
import RangeDisplayModeSelector from "./Settings/RangeDisplayModeSelector";
import TimeRangeSelector from "./Settings/TimeRangeSelector";
import WellFilter from "./Settings/WellFilter";
import WellPagination from "./Settings/WellPagination";
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
        <div
            className={classes.root}
            style={{
                minWidth: `${minWidth}px`,
                minHeight: `${minHeight}px`,
            }}
        >
            <TopBar className={classes.topBar}>
                <TopBar.Header className={classes.actions}>
                    <TimeRangeSelector />
                    <RangeDisplayModeSelector />
                </TopBar.Header>
                <TopBar.Actions className={classes.actions}>
                    <HideZeroCompletionsSwitch />
                    <ZoneSelector />
                    <WellFilter />
                </TopBar.Actions>
            </TopBar>
            <WellPagination />
            <WellCompletionsPlot plotData={dataInCurrentPage} />
        </div>
    );
};

WellCompletionsViewer.displayName = "WellCompletionsViewer";
export default WellCompletionsViewer;
