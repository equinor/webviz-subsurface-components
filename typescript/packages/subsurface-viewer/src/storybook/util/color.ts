import type { Color } from "@deck.gl/core";
import { rgb } from "d3-color";

/**
 * Get the rgba values of a hex color
 * @param color hex color
 * @returns rgba values
 */
export function getRgba(color: string): Color {
    const c = rgb(color);
    return [c.r, c.g, c.b, c.opacity * 255];
}
