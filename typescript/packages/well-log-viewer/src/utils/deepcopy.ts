import type { Template } from "../components/WellLogTemplateTypes";

export function deepCopy<T>(source: T): T {
    return JSON.parse(JSON.stringify(source)) as T;
}

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
