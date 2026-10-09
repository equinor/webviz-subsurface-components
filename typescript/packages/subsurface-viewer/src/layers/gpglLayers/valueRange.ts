import { decodeNormalizedValueWithNaNFromRGB } from "../shader_modules";

export type ValueRange = [number, number];

export function getFiniteValueRange(
    values: Float32Array,
    undefinedValue: number
): ValueRange | undefined {
    let min = Infinity;
    let max = -Infinity;

    for (const value of values) {
        if (!Number.isFinite(value) || value === undefinedValue) {
            continue;
        }
        min = Math.min(min, value);
        max = Math.max(max, value);
    }

    return min <= max ? [min, max] : undefined;
}

export function mergeValueRanges(
    range: ValueRange | undefined,
    additionalRange: ValueRange
): ValueRange {
    return range
        ? [
              Math.min(range[0], additionalRange[0]),
              Math.max(range[1], additionalRange[1]),
          ]
        : additionalRange;
}

export function decodeValueFromPickingColor(
    color: [number, number, number],
    valueRange: ValueRange
): number {
    const normalizedValue = decodeNormalizedValueWithNaNFromRGB(color);
    return valueRange[0] + normalizedValue * (valueRange[1] - valueRange[0]);
}
