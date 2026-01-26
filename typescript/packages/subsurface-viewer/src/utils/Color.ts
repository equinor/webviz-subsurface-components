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
 * Blends to color arrays together, following an additive blending pattern.
 * @param baseColor The underlying color.
 * @param addedColor The color to add on top. If this color has no opacity, the base color is fully overwritten
 * @returns The blended color as an RGBA array
 */
export function blendColors(baseColor: Color, addedColor: Color) {
    const alpha1 = (baseColor[3] ?? 255) / 255;
    const alpha2 = (addedColor[3] ?? 255) / 255;

    const mixedAlpha = 1 - (1 - alpha2) * (1 - alpha1);

    const mixChannel = (channel: number) => {
        const channel1Res =
            addedColor[channel] * alpha2 +
            baseColor[channel] * alpha1 * (1 - alpha2);

        return Math.round(channel1Res / mixedAlpha);
    };

    return [mixChannel(0), mixChannel(1), mixChannel(2), mixedAlpha * 255];
}
