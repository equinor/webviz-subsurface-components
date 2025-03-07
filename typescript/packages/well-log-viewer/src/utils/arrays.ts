import type { Domain } from "@equinor/videx-wellog/dist/common/interfaces";

/**
 * Utility type for various well-log things that are "named", such as tracks, plots and curves, and so on.
 */
export type Named = {
    name: string;
};

/**
 * Perform a case-insensitive index-search through a list of objects that have a specific "name" key
 * @param array A list of "named" elements
 * @param name A name to search for
 * @returns The index of the object matching the name. -1 if not found
 */
export function indexOfElementByName(array: Named[], name: string): number {
    if (array && name) {
        const nameUpper = name.toUpperCase();
        let i = 0;
        for (const element of array) {
            if (element.name && element.name.toUpperCase() === nameUpper) {
                return i;
            }
            i++;
        }
    }
    return -1;
}

/**
 * Perform a case-insensitive index-search through a list, with a series of possible names. Looks for the first name that exists in the list of names
 * @param array A list of "named" elements
 * @param names A list of names to search for.
 * @returns The index of the object matching the name. -1 if not found
 */
export function indexOfElementByNames(array: Named[], names: string[]): number {
    if (array && names) {
        /* names should be already in upper case */
        let i = 0;
        for (const element of array) {
            if (element.name && names.indexOf(element.name.toUpperCase()) >= 0)
                return i;
            i++;
        }
    }
    return -1;
}

/**
 * Perform a case-insensitive index-search through a list, returning the element itself if found.
 * @param namedArr A list of named elements
 * @param name A name to search for
 * @returns A named object, undefined if no matching name is found
 */
export function elementByName<T extends Named>(
    namedArr: T[],
    name: string
): T | undefined {
    const idx = indexOfElementByName(namedArr, name);
    return namedArr[idx];
}

/**
 * "Toggles" an entry in a list: removes the entry if its found; adds it if not
 * @param trackIds a list of simple entries (numbers or strings)
 * @param trackId an entry to "toggle"
 */
export function toggleId(
    trackIds: (string | number)[],
    trackId: string | number
): void {
    const i = trackIds.indexOf(trackId);
    if (i < 0) trackIds.push(trackId);
    else trackIds.splice(i, 1);
}

/**
 * Checks if two ranges are equal. A range is a tuple of start and end values (undefined also allowed).
 *
 * The function returns true if both ranges are undefined or if both ranges have the same start and end values.
 *
 * @param d1 - The first range to compare.
 * @param d2 - The second range to compare.
 * @returns True if the ranges are equal, false otherwise.
 */
export function isEqualRanges(
    d1: undefined | [number | undefined, number | undefined],
    d2: undefined | [number | undefined, number | undefined]
): boolean {
    if (!d1) return !d2;
    if (!d2) return !d1;
    return d1[0] === d2[0] && d1[1] === d2[1];
}

/**
 * Checks if two domains are equal. A domain is a tuple of start and end numbers.
 *
 * Two invalid domains are considered equal.
 *
 * @param d1 - The first domain to compare.
 * @param d2 - The second domain to compare.
 * @returns `true` if the domains are equivalent, `false` otherwise.
 */
// ? Conceptually very similar to isEqualRanges, should they be combined? (@anders2303)
export function isEqDomains(
    d1: Domain | [number, number],
    d2: Domain | [number, number]
): boolean {
    // ! We consider all invalid domains as equivalent
    if (d1.some(Number.isNaN) && d2.some(Number.isNaN)) return true;

    const eps: number = Math.abs(d1[1] - d1[0] + (d2[1] - d2[0])) * 0.00001;
    return Math.abs(d1[0] - d2[0]) < eps && Math.abs(d1[1] - d2[1]) < eps;
}

/**
 * Checks if two arrays are equal. Two arrays are considered equal if they have the same length and all elements are equal.
 *
 * Two undefined arrays are considered equal.
 *
 * @param d1 - The first array to compare.
 * @param d2 - The second array to compare.
 * @returns - `true` if the arrays are equal, `false` otherwise.
 */
// ? Conceptually very similar to isEqualRanges, should they be combined? (@anders2303)
export function isEqualArrays(
    d1: undefined | unknown[],
    d2: undefined | unknown[]
): boolean {
    if (!d1) return !d2;
    if (!d2) return !d1;

    const n = d1.length;
    if (n !== d2.length) return false;

    for (let i = 0; i < n; i++) {
        if (d1[i] !== d2[i]) return false;
    }
    return true;
}
