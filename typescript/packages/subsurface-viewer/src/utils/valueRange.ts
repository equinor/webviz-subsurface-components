import type { TypedArray } from "./typedArray";

/**
 * Range of values as a tuple [min, max].
 */
export type ValueRange = [number, number];

/**
 * Returns the finite value range of the given array, excluding the specified value.
 * Both min and max are finite and ordered (min <= max).
 * @param values - The array of numbers to evaluate.
 * @param excludedValue - The optional value to exclude from the range calculation.
 * @returns The finite value range as a tuple [min, max], or undefined if no finite values are found.
 */
export function getFiniteValueRange(
    values: TypedArray | number[],
    excludedValue?: number
): ValueRange | undefined {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const value of values) {
        if (!Number.isFinite(value) || value === excludedValue) {
            continue;
        }
        min = Math.min(min, value);
        max = Math.max(max, value);
    }

    return min <= max ? [min, max] : undefined;
}

/**
 * Merges two value ranges into a single range. If the additional range is undefined, the original range is returned.
 * The provided ranges are expected to be finite value ranges, that is both minimum and maximum values are finite and ordered
 * (min <= max).
 * @param range - first range to be merged
 * @param additionalRange - optional second range to be merged
 * @returns The merged value range as a tuple [min, max].
 */
export function mergeFiniteValueRanges(
    range: ValueRange,
    additionalRange: ValueRange | undefined
): ValueRange {
    return additionalRange
        ? [
              Math.min(range[0], additionalRange[0]),
              Math.max(range[1], additionalRange[1]),
          ]
        : range;
}
