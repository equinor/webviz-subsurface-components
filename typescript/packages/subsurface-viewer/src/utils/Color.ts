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

/**
 * Converts a color represented as an array of numbers (either RGB or RGBA) with 8-bit channel values (0-255)
 * into a normalized RGBA tuple with values in the range [0, 1].
 *
 * @param color - The input color as an array of numbers. It can be either:
 *   - [r, g, b]: An RGB color, where each channel is a number between 0 and 255.
 *   - [r, g, b, a]: An RGBA color, where each channel is a number between 0 and 255.
 * @returns A tuple [r, g, b, a] where each value is normalized to the range [0, 1].
 */
export function toNormalizedColor(
    color: Color | undefined
): RGBAColor | undefined {
    return color
        ? [
              color[0] / 255,
              color[1] / 255,
              color[2] / 255,
              color.length === 3 ? 1 : (color as RGBAColor)[3] / 255,
          ]
        : undefined;
}

/**
 * Blends to color arrays together, following deckk.gl's color blending approach.
 * @param color1 The first color to blend
 * @param color2 The second color to blend
 * @param mixRatio The ratio of color2 in the blend. 0 = only color1, 1 = only color2
 * @returns The blended color as an RGBA array
 */
export function blendColors(
    color1: Color,
    color2: Color,
    mixRatio: number = 0.5 // 0.5 seems to give the same color as Deck.gl
) {
    const alpha1 = (color1[3] ?? 255) / 255;
    const alpha2 = (color2[3] ?? 255) / 255;

    return [
        color1[0] * (1 - mixRatio) + color2[0] * mixRatio,
        color1[1] * (1 - mixRatio) + color2[1] * mixRatio,
        color1[2] * (1 - mixRatio) + color2[2] * mixRatio,

        // Blend alpha
        Math.min(255, (alpha1 + alpha2 * (1 - alpha1) * mixRatio) * 255),
    ];
}
