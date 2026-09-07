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
 * Returns the next color from a shared 8-entry palette, cycling once
 * exhausted. The palette index is a module-level counter shared by every
 * caller in the process, by design: real apps rendering several
 * `WellLogView`s rely on it to hand out non-colliding default colors across
 * instances.
 *
 * That sharing also means the color any one caller gets depends on how many
 * times `generateColor()` ran before it - unwanted for a caller that needs
 * colors independent of unrelated call order (e.g. Storybook stories). Use
 * {@link createColorGenerator} for that case instead.
 */
export function generateColor(): string {
    return __colors[__iPlotColor++ % __colors.length];
}

/**
 * Resets {@link generateColor}'s shared counter to the start of the palette.
 *
 * Test-harness-only (see `.storybook/preview.tsx`): resetting mid-session in
 * a real app would break the cross-instance color assignment this counter
 * exists for. Only safe to call immediately before a full story/page
 * remount, never mid-render.
 */
export function resetColorGenerator(): void {
    __iPlotColor = 0;
}

/**
 * Creates an independent color generator over the same 8-entry palette as
 * {@link generateColor}, but with its own counter that never reads or
 * advances the shared one - safe for callers that need deterministic colors
 * regardless of unrelated call order (e.g. Storybook stories).
 *
 * @returns A zero-argument function returning the next color each call,
 * cycling once the palette is exhausted.
 */
export function createColorGenerator(): () => string {
    let iPlotColor = 0;
    return () => __colors[iPlotColor++ % __colors.length];
}
