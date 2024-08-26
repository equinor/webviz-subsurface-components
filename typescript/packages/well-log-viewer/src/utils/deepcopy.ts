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

    source?.styles?.forEach((style, index) => {
        const target_style = target.styles?.at(index);
        if (target_style) {
            if (style.colorTable && typeof style.colorTable == "function") {
                target_style.colorTable = style.colorTable;
            }
            if (
                style.inverseColorTable &&
                typeof style.inverseColorTable == "function"
            ) {
                target_style.inverseColorTable = style.inverseColorTable;
            }
        }
    });

    return target;
}
