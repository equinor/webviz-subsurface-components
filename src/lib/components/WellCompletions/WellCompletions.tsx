import { createStyles, makeStyles } from "@material-ui/core";
import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";
import { Provider as ReduxProvider } from "react-redux";
import DataLoader from "./components/DataLoader";
import TimeRangeSelector from "./components/TimeRangeSelector";
import D3WellCompletions from "./components/well_completions";
import { REDUX_STORE } from "./redux/store";
import { DataInput } from "./redux/types";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            position: "relative",
            display: "flex",
            flexGrow: 1,
            flexDirection: "column",
        },
    })
);

interface Props {
    id: string;
    data: {};
}
const WellCompletions: React.FC<Props> = React.memo(({ id, data }) => {
    const classes = useStyles();
    const d3wellcompletions = useRef(new D3WellCompletions(id, data));
    useEffect(() => {
        d3wellcompletions.current.renderPlot();

        window.addEventListener("resize", () =>
            d3wellcompletions.current.renderPlot()
        );
    }, []);
    return (
        <ReduxProvider store={REDUX_STORE}>
            <DataLoader data={data as DataInput}>
                <div className={classes.root}>
                    <TimeRangeSelector />
                    <div id={id}></div>
                </div>
            </DataLoader>
        </ReduxProvider>
    );
});

WellCompletions.displayName = "WellCompletions";
WellCompletions.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
};
export default WellCompletions;
