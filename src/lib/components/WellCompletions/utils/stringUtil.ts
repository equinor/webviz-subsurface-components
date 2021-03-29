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

export const getRegexPredicate = (
    pattern: string
): ((item: string) => boolean) => {
    const processed: string[] = [];
    for (let index = 0; index < pattern.length; index++) {
        const character = pattern.charAt(index);

        if (
            index === 0 ||
            !SPECIAL_ESCAPE.includes(pattern.charAt(index - 1))
        ) {
            // Add a dot before each "*" and "?" unless it's preceded by a dot already or a closing brace
            if (SPECIAL_CHARACTERS.includes(character)) {
                processed.push(".");
                if (character === "?") {
                    continue; // '?' is replaced with '.'
                }
            }
            // Add "\\" before each "+" unless it's preceded by a dot already or a closing brace
            if (ESCAPE_CHAR.includes(character)) {
                processed.push("\\");
            }
        }
        processed.push(character);
    }

    const processedPattern = processed.join("").toLowerCase();

    const rgx: RegExp | undefined = new RegExp(processedPattern);

    return (item: string): boolean => {
        if (pattern.length === 0) return true;
        return rgx ? rgx.test(item.toLowerCase()) : false;
    };
};
/**
 * capitalize the first letter in the given name
 * @param name
 */
export const capitalizeFirstLetter = (name: string): string => {
    return name.length === 0 ? name : name[0].toUpperCase() + name.slice(1);
};
