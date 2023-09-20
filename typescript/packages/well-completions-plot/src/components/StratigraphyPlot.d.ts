import React from "react";
import type { Zone } from "../types/dataTypes";
import type { Padding, PlotLayout } from "../types/layoutTypes";
interface StratigraphyPlotProps {
    data: Zone[];
    layout: PlotLayout;
    padding: Padding;
}
export declare const StratigraphyPlot: React.FC<StratigraphyPlotProps>;
export {};
