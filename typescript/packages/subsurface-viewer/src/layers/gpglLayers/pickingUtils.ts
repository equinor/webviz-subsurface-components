import type { ValueRange } from "../../utils/valueRange";

import { decodeNormalizedValueWithNaNFromRGB } from "../shader_modules";

export function decodeValueFromPickingColor(
    color: [number, number, number],
    valueRange: ValueRange
): number {
    const normalizedValue = decodeNormalizedValueWithNaNFromRGB(color);
    return valueRange[0] + normalizedValue * (valueRange[1] - valueRange[0]);
}
