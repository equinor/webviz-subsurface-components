import React from "react";
import { useResizeDetector } from "react-resize-detector";
import { TooltipProvider } from "./components/TooltipProvider";
import { CompletionsPlot } from "./components/CompletionsPlot";
import { createLayout, Padding } from "./types/layoutTypes";
import { StratigraphyPlot } from "./components/StratigraphyPlot";
import { WellsPlot } from "./components/WellsPlot";

import { PlotData } from "./types/dataTypes";
export { PlotData } from "./types/dataTypes";

import "./WellCompletionsPlot.css";

export interface WellCompletionsPlotProps {
    id: string;
    timeSteps: string[];
    plotData: PlotData;
}

const padding: Padding = { left: 80, right: 50, top: 70, bottom: 50 };
/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
export const WellCompletionsPlot: React.FC<WellCompletionsPlotProps> =
    React.memo((props: WellCompletionsPlotProps) => {
        const { width, height, ref } = useResizeDetector({
            refreshMode: "debounce",
            refreshRate: 50,
            refreshOptions: { trailing: true },
        });

        const layout = React.useMemo(
            () =>
                width !== undefined && height !== undefined
                    ? createLayout(width, height, padding)
                    : undefined,
            [width, height]
        );

        return (
            <TooltipProvider>
                <div
                    ref={ref as React.LegacyRef<HTMLDivElement>}
                    id={props.id}
                    className={"WellCompletionsPlot"}
                    data-tip
                    data-for="plot-tooltip"
                >
                    {layout && props.plotData && (
                        <svg
                            id={"svg-context"}
                            width={width}
                            height={height}
                            style={{ position: "relative" }}
                        >
                            <StratigraphyPlot
                                data={props.plotData?.stratigraphy ?? []}
                                layout={layout}
                                padding={padding}
                            />
                            <WellsPlot
                                timeSteps={props.timeSteps}
                                plotData={props.plotData}
                                layout={layout}
                                padding={padding}
                            />
                            {props.plotData && (
                                <CompletionsPlot
                                    plotData={props.plotData}
                                    layout={layout}
                                    padding={padding}
                                />
                            )}
                        </svg>
                    )}
                </div>
            </TooltipProvider>
        );
    });

WellCompletionsPlot.displayName = "WellCompletionsPlot";
