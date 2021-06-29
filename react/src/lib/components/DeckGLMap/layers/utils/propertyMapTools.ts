import { PickInfo } from "@deck.gl/core/lib/deck";
import { RGBColor } from "@deck.gl/core/utils/color";

export interface BitmapPickInfo extends PickInfo<unknown> {
    color?: RGBColor;
}

export interface PropertyMapPickInfo extends BitmapPickInfo {
    propertyValue?: number;
}

export interface ValueDecoder {
    rgbScaler: [number, number, number];
    floatScaler: number;
    offset: number;
    step: number;
}

export function decodeRGB(
    [r, g, b]: RGBColor,
    decoder: ValueDecoder,
    remapToRange?: [number, number]
): number {
    const { rgbScaler, floatScaler, offset, step } = decoder;
    const [rScale, gScale, bScale] = rgbScaler;

    r *= rScale * 256.0 * 256.0;
    g *= gScale * 256.0;
    b *= bScale;

    let decodedValue = (r + g + b + offset) * floatScaler;

    if (step > 0) {
        decodedValue = Math.floor(decodedValue / step + 0.5) * step;
    }

    if (remapToRange) {
        const [min, max] = remapToRange;
        // If we know the min and max values, remap the [0, 1] decoded value to [min, max]
        decodedValue = decodedValue * (max - min) + min;
    }

    return decodedValue;
}
