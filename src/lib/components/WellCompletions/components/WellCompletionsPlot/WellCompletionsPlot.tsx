import { createStyles, makeStyles } from "@material-ui/core";
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useResizeDetector } from "react-resize-detector";
import { WellCompletionsState } from "../../redux/store";
import { D3WellCompletions } from "./D3WellCompletions";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            display: "flex",
            flex: 1,
        },
        main: {
            width: "100%",
            height: "100%",
        },
    })
);
const WellCompletionsPlot: React.FC = () => {
    const classes = useStyles();
    // A reference to the div storing the plots
    const d3wellcompletions = useRef<D3WellCompletions>();
    const { width, height, ref } = useResizeDetector<HTMLDivElement>({
        refreshMode: "debounce",
        refreshRate: 100,
        refreshOptions: { trailing: true },
    });
    const id = useSelector((state: WellCompletionsState) => state.id);
    const data = useSelector(
        (state: WellCompletionsState) => state.dataModel.data
    );

    // Effects
    useEffect(() => {
        if (!d3wellcompletions.current) {
            d3wellcompletions.current = new D3WellCompletions(
                id,
                ref.current as HTMLDivElement
            );
        }
    }, [id]);

    useEffect(() => {
        if (data && d3wellcompletions.current) {
            d3wellcompletions.current.setData(data);
            d3wellcompletions.current.draw();
        }
    }, [data]);

    useEffect(() => {
        if (
            d3wellcompletions.current &&
            width !== undefined &&
            height !== undefined
        ) {
            d3wellcompletions.current.resize(width, height);
            d3wellcompletions.current.draw();
        }
    }, [width, height]);
    // on unmount
    useEffect(() => {
        return () => d3wellcompletions.current?.clear();
    }, []);

    return <div className={classes.root} ref={ref} />;
};

export default WellCompletionsPlot;
