/**
 * Scales all elements in a numeric array by a given factor
 * @param array The array to scale
 * @param factor The scaling factor
 * @returns A new array with all elements scaled
 */
export function scaleArray<T extends number[]>(array: T, factor: number): T {
    return array.map((v) => v * factor) as T;
}
