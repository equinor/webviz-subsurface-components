import type { Template } from "../components/WellLogTemplateTypes";

export function deepCopy<T>(source: T): T {
    return JSON.parse(JSON.stringify(source)) as T;
}

/*
 * deepCopyTemplate adds specific functionality above the regular deepCopy function which is specific to templates
 * deep copy using JSON or any other function does not copy over fields with functions. Since coloring function is
 * added to the style field of the template in order to be used it must be copied over from the props
 */
export function deepCopyTemplate(source: Template): Template {
    const target = deepCopy(source);
    return target;
}
