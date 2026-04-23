/**
 * Represents a range defined by two numeric boundaries.
 * @typeParam 0 - The start value of the range
 * @typeParam 1 - The end value of the range
 */
export type Range = [number, number];

/**
 * Represents an open-ended range where either or both bounds can be undefined.
 * @typeParam 0 - The start value of the range, or undefined if no lower limit
 * @typeParam 1 - The end value of the range, or undefined if no upper limit

 * 
 * @example
 * // A range from 10 to 20
 * const range: OpenRange = [10, 20];
 * 
 * @example
 * // An open range starting from 5 with no upper limit
 * const range: OpenRange = [5, undefined];
 * 
 * @example
 * // An open range with no lower limit, ending at 100
 * const range: OpenRange = [undefined, 100];
 * 
 * @example
 * // A completely open range
 * const range: OpenRange = [undefined, undefined];
 */
export type OpenRange = [number | undefined, number | undefined];
