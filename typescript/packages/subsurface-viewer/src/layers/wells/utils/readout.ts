import type { PropertyDataType } from "../../utils/layerTools";
import type {
    ScreenProperties,
    WellFeature,
    PerforationProperties,
} from "../types";

/**
 * Creates a readout object that contains relevant screen information
 * @param screen A well trajectory screen object
 * @param parentWellFeature The well that the screen belongs to
 * @returns A PropertyDataType object or null if no screen is provided
 */

export function createScreenReadout(
    screen: ScreenProperties | undefined,
    parentWellFeature: WellFeature
): PropertyDataType | null {
    if (!screen) return null;

    return {
        name: `Screen ${parentWellFeature.properties.name}`,
        value: screen.name,
        color: parentWellFeature.properties?.color,
    };
}

/**
 * Creates a readout object that contains relevant perforation information
 * @param perforation A well trajectory perforation object
 * @param parentWellFeature The well that the perforation belongs to
 * @returns A PropertyDataType object or null if no perforation is provided
 */

export function createPerforationReadout(
    perforation: PerforationProperties | undefined,
    parentWellFeature: WellFeature
): PropertyDataType | null {
    if (!perforation) return null;

    return {
        name: perforation.name,
        value: perforation.status,
        color: parentWellFeature.properties?.color,
    };
}
