/**
 * Characters to be prepended by "." unless it's already there or it matches {@link SPECIAL_ESCAPE}
 */
const SPECIAL_CHARACTERS = "?*";
/**
 * Characters to be prepended by "\\" unless it's already there or it matches {@link SPECIAL_ESCAPE}
 */
const ESCAPE_CHAR = "+";
/**
 * Escape characters that result in no prepending of "."
 */
const SPECIAL_ESCAPE = "\\.)]";

/**
 * Get a regex matcher function that checks if the given item matches the given pattern,
 * e.g. well name as item, to match a search text provided as pattern.
 *
 * @param pattern the pattern to match
 * @returns a regex match function that checks if the given string item matches the given pattern
 */
export const createWellNameRegexMatcher = (
    pattern: string
): ((item: string) => boolean) => {
    const processed: string[] = [];

    for (const [index, character] of [...pattern].entries()) {
        const prevChar = index === 0 ? undefined : pattern.charAt(index - 1);

        if (prevChar === undefined || !SPECIAL_ESCAPE.includes(prevChar)) {
            // Add a dot before each "*" and "?" unless it's preceded by a dot already or a closing brace
            if (SPECIAL_CHARACTERS.includes(character)) {
                processed.push(".");
                if (character === "?") continue; // '?' is replaced with '.'
            }
            // Add "\\" before each "+" unless it's preceded by a dot already or a closing brace
            if (ESCAPE_CHAR.includes(character)) {
                processed.push("\\");
            }
        }
        processed.push(character);
    }

    const processedPattern = processed.join("").toLowerCase();
    let rgx: RegExp | undefined;

    try {
        rgx = new RegExp(processedPattern);
    } catch (e) {
        console.warn(`Will return false for all items: ${processedPattern}`, e);
        return () => false;
    }

    return (item: string): boolean => {
        if (pattern.length === 0) return true;
        return rgx.test(item.toLowerCase());
    };
};
