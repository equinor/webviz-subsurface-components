import {
    createStyles,
    Divider,
    Drawer,
    makeStyles,
    // eslint-disable-next-line prettier/prettier
    Theme
} from "@material-ui/core";
import clsx from "clsx";
import React, { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import ReactResizeDetector from "react-resize-detector";
import { usePlotData } from "../hooks/usePlotData";
import { WellCompletionsState } from "../redux/store";
import { DataContext } from "./DataLoader";
import WellCompletionsPlot from "./Plot/WellCompletionsPlot";
import HideZeroCompletionsSwitch from "./Settings/HideZeroCompletionsSwitch";
import SettingsBar from "./Settings/SettingsBar";
import WellAttributesSelector from "./Settings/WellAttributesSelector";
import WellFilter from "./Settings/WellFilter";
import WellPagination from "./Settings/WellPagination";
import ZoneSelector from "./Settings/ZoneSelector";

const drawerWidth = 270;
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: "relative",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            width: "100%",
            height: "90%",
        },
        main: {
            position: "relative",
            display: "flex",
            flex: 1,
            flexDirection: "row",
            height: "100%",
        },
        drawer: {
            zIndex: 0,
            width: drawerWidth,
            flexShrink: 0,
        },
        drawerShift: {
            width: 0,
            flexShrink: 0,
            display: "none",
        },
        drawerPaper: {
            position: "relative",
        },
        drawerHeader: {
            display: "flex",
            alignItems: "center",
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
            justifyContent: "flex-start",
        },
        content: {
            width: "100%",
            transition: theme.transitions.create("margin", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        contentShift: {
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create("margin", {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
    })
);

const WellCompletionsViewer: React.FC = () => {
    const classes = useStyles();

    // Use input data directly
    const data = useContext(DataContext);
    // Create plot data with the selected time step(s)
    const plotData = usePlotData();

    // Redux
    const isDrawerOpen = useSelector(
        (state: WellCompletionsState) => state.ui.isDrawerOpen
    );
    const wellsPerPage = useSelector(
        (state: WellCompletionsState) => state.ui.wellsPerPage
    );
    const currentPage = useSelector(
        (state: WellCompletionsState) => state.ui.currentPage
    );
    // Memo
    const dataInCurrentPage = useMemo(() => {
        return {
            ...plotData,
            wells: plotData.wells.slice(
                (currentPage - 1) * wellsPerPage,
                currentPage * wellsPerPage
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
    // Render
    return (
        <div className={classes.root}>
            {/* We detect the resize of the element and resize the plot accordingly */}
            <ReactResizeDetector handleWidth handleHeight>
                {({ width }) => (
                    <>
                        <SettingsBar />
                        <div
                            className={classes.main}
                            style={{
                                width: `${width}px`,
                            }}
                        >
                            <div
                                className={clsx(classes.content, {
                                    [classes.contentShift]: isDrawerOpen,
                                })}
                            >
                                <WellPagination />
                                <div
                                    style={{
                                        minWidth: `${minWidth}px`,
                                        minHeight: `${minHeight}px`,
                                        height: "100%",
                                    }}
                                >
                                    <WellCompletionsPlot
                                        timeSteps={data.timeSteps}
                                        plotData={dataInCurrentPage}
                                    />
                                </div>
                            </div>
                            {/* Drawer on the right-hand side (hidden by default) that shows the filter options */}
                            <Drawer
                                className={clsx(classes.drawer, {
                                    [classes.drawerShift]: !isDrawerOpen,
                                })}
                                classes={{
                                    paper: classes.drawerPaper,
                                }}
                                variant="persistent"
                                anchor="right"
                                open={isDrawerOpen}
                            >
                                <Divider />
                                <ZoneSelector />
                                <WellFilter />
                                <HideZeroCompletionsSwitch />
                                <WellAttributesSelector />
                            </Drawer>
                        </div>
                    </>
                )}
            </ReactResizeDetector>
        </div>
    );
};

WellCompletionsViewer.displayName = "WellCompletionsViewer";
export default WellCompletionsViewer;
