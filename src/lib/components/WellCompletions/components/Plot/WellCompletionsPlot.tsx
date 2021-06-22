import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useMemo } from "react";
import { useResizeDetector } from "react-resize-detector";
import { PlotData } from "../../utils/dataUtil";
import { TooltipProvider } from "../Common/TooltipProvider";
import CompletionsPlot from "./CompletionsPlot";
import { getLayout, Padding } from "./plotUtil";
import StratigraphyPlot from "./StratigraphyPlot";
import WellsPlot from "./WellsPlot";

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
    timeSteps: string[];
    plotData: PlotData;
}

const padding: Padding = { left: 80, right: 50, top: 70, bottom: 50 };
/* eslint-disable react/prop-types */
const WellCompletionsPlot: React.FC<Props> = React.memo(
    ({ timeSteps, plotData }) => {
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
            <TooltipProvider>
                <div
                    className={classes.root}
                    ref={ref as React.LegacyRef<HTMLDivElement>}
                    data-tip
                    data-for="plot-tooltip"
                >
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
                                timeSteps={timeSteps}
                                plotData={plotData}
                                layout={layout}
                                padding={padding}
                            />
                            <CompletionsPlot
                                plotData={plotData}
                                layout={layout}
                                padding={padding}
                            />
                        </svg>
                    )}
                </div>
            </TooltipProvider>
        );
    }
);

export default WellCompletionsPlot;
