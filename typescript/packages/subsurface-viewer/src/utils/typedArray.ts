/**
 * Utility types and functions for working with JavaScript TypedArrays.
 *
 * - TypedIntArray: All integer TypedArray types.
 * - TypedFloatArray: All floating-point TypedArray types.
 * - TypedArray: Union of all supported TypedArray types.
 * - isTypedArray: Type guard for TypedArray (excluding DataView).
 * - isNumberArray: Type guard for number[] arrays.
 * - TConstructor: Generic constructor type for TypedArrays.
 * - toTypedArray: Converts number[] or TypedArray to a specific TypedArray type.
 */

/**
 * All supported integer TypedArray types.
 */
export type TypedIntArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array;

/**
 * All supported floating-point TypedArray types.
 */
export type TypedFloatArray = Float32Array | Float64Array;

/**
 * Union of all supported TypedArray types (integer and float).
 */
export type TypedArray = TypedIntArray | TypedFloatArray;

/**
 * Type guard: Returns true if value is a TypedArray (but not DataView).
 */
export function isTypedArray(value: unknown): value is TypedArray {
    return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

/**
 * Type guard: Returns true if value is an array of numbers.
 */
export function isNumberArray(value: unknown): value is number[] {
    return (
        Array.isArray(value) &&
        (value.length === 0 || typeof value[0] === "number")
    );
}

/**
 * Generic constructor type for any class.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TConstructor<T> = new (...args: any) => T;

/**
 * Converts a number[] or TypedArray to a specific TypedArray type.
 * If the input is already of the correct type, it is returned as-is.
 *
 * @param constructor - The TypedArray constructor (e.g., Float32Array)
 * @param data - The input data (number[] or TypedArray)
 * @returns The data as the specified TypedArray type
 */
export function toTypedArray<T extends TypedArray>(
    constructor: TConstructor<T>,
    data: TypedArray | number[]
): T {
    if (ArrayBuffer.isView(data) && data instanceof constructor) {
        return data;
    }
    if (data instanceof constructor) {
        return data as T;
    }
    return new constructor(data);
}
