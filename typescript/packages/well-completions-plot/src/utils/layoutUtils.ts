import type { Padding, PlotLayout } from "../types/layoutTypes";

export function createLayout(
    width: number,
    height: number,
    padding: Padding = { bottom: 0, top: 0, left: 0, right: 0 }
): PlotLayout {
    const xRange: [number, number] = [padding.left, width - padding.right];
    const yRange: [number, number] = [height - padding.bottom, padding.top];
    const xExtent = Math.abs(xRange[0] - xRange[1]);
    const yExtent = Math.abs(yRange[0] - yRange[1]);
    const topLeft: [number, number] = [padding.left, padding.top];
    const bottomRight: [number, number] = [
        width - padding.right,
        height - padding.bottom,
    ];

    return {
        width: width,
        height: height,
        xRange: xRange,
        yRange: yRange,
        xExtent: xExtent,
        yExtent: yExtent,
        topLeft: topLeft,
        bottomRight: bottomRight,
    };
}
