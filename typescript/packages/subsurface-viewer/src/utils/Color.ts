/**
 * Color type definition from Deck.gl.
 *
 * - Color: Imported from @deck.gl/core, typically an array of 3 or 4 numbers (RGB or RGBA).
 */
import type { Color } from "@deck.gl/core";

export type { Color };

/**
 * RGB color represented as a tuple of three numbers: [red, green, blue].
 */
export type RGBColor = [number, number, number];

/**
 * RGBA color represented as a tuple of four numbers: [red, green, blue, alpha].
 */
export type RGBAColor = [number, number, number, number];
