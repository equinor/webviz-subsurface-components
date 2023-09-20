 
import React from "react";
import type { PlotData } from "../types/dataTypes";
import type { Padding, PlotLayout } from "../types/layoutTypes";
interface WellsPlotProps {
    timeSteps: string[];
    plotData: PlotData;
    layout: PlotLayout;
    padding: Padding;
}
export declare const WellsPlot: React.FC<WellsPlotProps>;
export {};
