import { createStyles, makeStyles } from "@material-ui/core";
import React, { useMemo } from "react";
import { useResizeDetector } from "react-resize-detector";
import { PlotData } from "../../hooks/dataUtil";
import CompletionsPlot from "./CompletionsPlot";
import { getLayout, Padding } from "./plotUtil";
import StratigraphyPlot from "./StratigraphyPlot";
import WellsPlot from "./WellsPlot";

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

const padding: Padding = { left: 50, right: 50, top: 50, bottom: 50 };
/* eslint-disable react/prop-types */
const WellCompletionsPlot: React.FC<Props> = React.memo(({ plotData }) => {
    const classes = useStyles();
    const { width, height, ref } = useResizeDetector<HTMLDivElement>({
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
        <div className={classes.root} ref={ref}>
            {layout && (
                <svg
                    id={"svg-context"}
                    width={width}
                    height={height}
                    style={{ position: "relative" }}
                >
                    <StratigraphyPlot
                        data={plotData.stratigraphy}
                        layout={layout}
                        padding={padding}
                    />
                    <WellsPlot
                        data={plotData.wells}
                        layout={layout}
                        padding={padding}
                    />
                    <CompletionsPlot
                        data={plotData}
                        layout={layout}
                        padding={padding}
                    />
                </svg>
            )}
        </div>
    );
});

WellCompletionsPlot.displayName = "WellCompletionsPlot";
export default WellCompletionsPlot;
