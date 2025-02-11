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
