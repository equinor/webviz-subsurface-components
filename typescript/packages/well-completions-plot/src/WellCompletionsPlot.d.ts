import React from "react";
import type { PlotData } from "./types/dataTypes";
import "./WellCompletionsPlot.css";
export interface WellCompletionsPlotProps {
    id: string;
    timeSteps: string[];
    plotData: PlotData;
}
export declare const WellCompletionsPlot: React.FC<WellCompletionsPlotProps>;
