import { createStyles, makeStyles } from "@material-ui/core";
import React, { useEffect, useRef } from "react";
import { useResizeDetector } from "react-resize-detector";
import { PlotData } from "../../hooks/dataUtil";
import { D3WellCompletions } from "./D3WellCompletions";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            display: "flex",
            flex: 1,
            height: "80%",
        },
    })
);
interface Props {
    plotData: PlotData;
}
/* eslint-disable react/prop-types */
const WellCompletionsPlot: React.FC<Props> = React.memo(({ plotData }) => {
    const classes = useStyles();
    // A reference to the div storing the plots
    const d3wellcompletions = useRef<D3WellCompletions>();
    const { width, height, ref } = useResizeDetector<HTMLDivElement>({
        refreshMode: "debounce",
        refreshRate: 100,
        refreshOptions: { trailing: true },
    });
    // On mount
    useEffect(() => {
        if (!d3wellcompletions.current) {
            d3wellcompletions.current = new D3WellCompletions(
                ref.current as HTMLDivElement
            );
        }
    }, []);

    //Data changed
    useEffect(() => {
        if (d3wellcompletions.current) {
            d3wellcompletions.current.setPlotData(plotData);
        }
    }, [plotData]);
    //Resize
    useEffect(() => {
        if (
            d3wellcompletions.current &&
            width !== undefined &&
            height !== undefined
        ) {
            d3wellcompletions.current.resize(width, height);
        }
    }, [width, height]);
    // On unmount
    useEffect(() => {
        return () => d3wellcompletions.current?.clear();
    }, []);

    return <div className={classes.root} ref={ref} />;
});

export default WellCompletionsPlot;
