import { Typography } from "@equinor/eds-core-react";
import { createStyles, makeStyles } from "@material-ui/core";
import { Pagination } from "@material-ui/lab";
import { clamp } from "lodash";
import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePlotData } from "../../hooks/usePlotData";
import { updateCurrentPage } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";
const useStyles = makeStyles(() =>
    createStyles({
        root: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
        },
        left: {
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            padding: "5px",
        },
        right: {
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
        },
    })
);
/**
 * Divide wells into pages
 */
const WellPagination: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    const plotData = usePlotData();
    const currentPage = useSelector(
        (st: WellCompletionsState) => st.ui.currentPage
    );
    const wellsPerPage = useSelector(
        (st: WellCompletionsState) => st.ui.wellsPerPage
    );
    // Memo
    const wellsCount = useMemo(() => plotData.wells.length, [plotData]);
    const pageCount = useMemo(
        () => Math.ceil(plotData.wells.length / wellsPerPage),
        [plotData, wellsPerPage]
    );
    const currentClampedPage = useMemo(
        () => clamp(currentPage, 1, pageCount),
        [currentPage, pageCount]
    );
    const startItem = useMemo(
        () => (currentClampedPage - 1) * wellsPerPage + 1,
        [currentClampedPage, wellsPerPage]
    );

    const endItem = useMemo(
        () => Math.min(wellsCount, currentClampedPage * wellsPerPage),
        [currentClampedPage, wellsPerPage, wellsCount]
    );
    // Handlers
    const onCurrentPageChange = useCallback(
        (...arg) => dispatch(updateCurrentPage(arg[1])),
        [dispatch]
    );

    // Effects
    useEffect(() => {
        dispatch(updateCurrentPage(currentClampedPage));
    }, [currentClampedPage]);

    // Render
    return (
        <div className={classes.root}>
            <div className={classes.left}>
                {/* Indicates what the current page is displaying*/}
                <Typography
                    style={{ alignSelf: "center", minWidth: "125px" }}
                >{`${startItem} - ${endItem} of ${wellsCount} items`}</Typography>
            </div>
            <Pagination
                className={classes.right}
                defaultPage={1}
                page={currentClampedPage}
                count={pageCount}
                size="medium"
                onChange={onCurrentPageChange}
            />
        </div>
    );
});

WellPagination.displayName = "WellPagination";
export default WellPagination;
