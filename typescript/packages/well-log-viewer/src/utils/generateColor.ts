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

// Creates an independent color generator with its own counter, starting from
// the beginning of the palette. Useful when a caller needs deterministic,
// self-contained colors without consuming from (or being affected by) the
// shared module-level counter used by generateColor().
export function createColorGenerator(): () => string {
    let iPlotColor = 0;
    return () => __colors[iPlotColor++ % __colors.length];
}
