export interface PlotLayout {
    width: number;
    height: number;
    xRange: [number, number];
    yRange: [number, number];
    xExtent: number;
    yExtent: number;
    topLeft: [number, number];
    bottomRight: [number, number];
}
export interface Padding {
    left: number;
    right: number;
    top: number;
    bottom: number;
}
