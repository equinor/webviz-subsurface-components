const __colors = [
    "red",
    "blue",
    "orange",
    "green",
    "red",
    "magenta",
    "gray",
    "brown",
];
let __iPlotColor = 0;
export function generateColor(): string {
    return __colors[__iPlotColor++ % __colors.length];
}
