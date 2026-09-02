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

/**
 * Returns the next color from a shared 8-entry palette, cycling back to the
 * start once the palette is exhausted.
 *
 * The palette index is a **module-level counter that is never reset**. Every
 * call anywhere in the process — across all templates and, in Storybook's
 * test-runner, across every story rendered in the same test file — advances
 * the same counter. That makes the colors handed out to any given caller
 * depend on how many times `generateColor()` was called *before* it, i.e. on
 * unrelated code that happened to run first.
 *
 * For a caller that needs colors which do not depend on (and do not affect)
 * this shared state, use {@link createColorGenerator} instead.
 */
export function generateColor(): string {
    return __colors[__iPlotColor++ % __colors.length];
}

/**
 * Creates an independent color generator over the same 8-entry palette used
 * by {@link generateColor}, with its own counter starting at the beginning of
 * the palette.
 *
 * Unlike {@link generateColor}, calling the returned function never reads or
 * advances the shared module-level counter, so it is safe to use whenever
 * deterministic, self-contained colors are required — for example to keep a
 * Storybook story's colors independent of story declaration order.
 *
 * @returns A zero-argument function that returns the next color each time
 * it's called, cycling back to the start once the palette is exhausted.
 */
export function createColorGenerator(): () => string {
    let iPlotColor = 0;
    return () => __colors[iPlotColor++ % __colors.length];
}
