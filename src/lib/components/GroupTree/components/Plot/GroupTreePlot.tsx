import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useMemo } from "react";
import { useResizeDetector } from "react-resize-detector";
import { FlowRate, Node } from "../../redux/types";
import "./dynamic_tree.css";
import { getLayout, Padding } from "./plotUtil";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: "flex",
            flex: 1,
            height: "80%",
            padding: theme.spacing(1),
        },
    })
);
interface Props {
    root: Node;
    currentFlowRate: FlowRate;
}

const padding: Padding = { left: 80, right: 50, top: 70, bottom: 50 };
/* eslint-disable react/prop-types */
const GroupTreePlot: React.FC<Props> = React.memo(
    ({ root, currentFlowRate }) => {
        const classes = useStyles();
        const { width, height, ref } = useResizeDetector({
            refreshMode: "debounce",
            refreshRate: 50,
            refreshOptions: { trailing: true },
        });
        const layout = useMemo(
            () =>
                width !== undefined && height !== undefined
                    ? getLayout(width, height, padding)
                    : undefined,
            [width, height]
        );

        return (
            <div
                className={classes.root}
                ref={ref as React.LegacyRef<HTMLDivElement>}
                data-tip
                data-for="plot-tooltip"
            >
                {layout && (
                    <svg id={"svg-context"} width={width} height={height}>
                        <g
                            transform={`translate(${padding.left},${padding.top})`}
                        ></g>
                    </svg>
                )}
            </div>
        );
    }
);

export default GroupTreePlot;
