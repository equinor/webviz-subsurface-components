import { createStyles, makeStyles } from "@material-ui/core";
import { throttle } from "lodash";
import React, { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import ReactResizeDetector from "react-resize-detector";
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
    const id = useSelector((state: WellCompletionsState) => state.id);
    const data = useSelector(
        (state: WellCompletionsState) => state.dataModel.data
    );

    // A reference to the div storing the plots
    const divRef = useRef<HTMLDivElement>();
    const d3wellcompletions = useRef<D3WellCompletions>();

    const onResize = useMemo(
        () =>
            throttle(
                () => {
                    if (d3wellcompletions.current) {
                        d3wellcompletions.current.resize();
                        d3wellcompletions.current.draw();
                    }
                },
                100,
                { trailing: true }
            ),
        []
    );

    // Effects
    useEffect(() => {
        if (!d3wellcompletions.current) {
            d3wellcompletions.current = new D3WellCompletions(
                id,
                divRef.current as HTMLDivElement
            );
        }
    }, [id]);

    useEffect(() => {
        if (data && d3wellcompletions.current) {
            d3wellcompletions.current.setData(data);
            d3wellcompletions.current.draw();
        }
    }, [data]);
    // on unmount
    useEffect(() => {
        return () => d3wellcompletions.current?.clear();
    }, []);

    return (
        <ReactResizeDetector handleHeight handleWidth onResize={onResize}>
            <div className={classes.root}>
                <div
                    className={classes.main}
                    ref={divRef as React.MutableRefObject<HTMLDivElement>}
                />
            </div>
        </ReactResizeDetector>
    );
};

export default WellCompletionsPlot;
