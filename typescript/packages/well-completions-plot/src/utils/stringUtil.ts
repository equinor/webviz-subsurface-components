/**
 * capitalize the first letter in the given name
 * @param name
 */
export const capitalizeFirstLetter = (name: string): string => {
    return name.length === 0 ? name : name[0].toUpperCase() + name.slice(1);
};
