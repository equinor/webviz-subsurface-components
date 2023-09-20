 
import React from "react";
import type { PlotData } from "../types/dataTypes";
import type { Padding, PlotLayout } from "../types/layoutTypes";
interface CompletionsPlotProps {
    plotData: PlotData;
    layout: PlotLayout;
    padding: Padding;
}
export declare const CompletionsPlot: React.FC<CompletionsPlotProps>;
export {};
