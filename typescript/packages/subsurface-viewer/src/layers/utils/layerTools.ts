import type { BoundingBox3D } from "../../utils";
import { computeBoundingBox as buildBoundingBox } from "../../utils/BoundingBox3D";

export function invertZCoordinate(dataArray: Float32Array): void {
    for (let i = 2; i < dataArray.length; i += 3) {
        dataArray[i] *= -1;
    }
}

/**
 * Calculates the axis-aligned bounding box for a set of 3D points.
 *
 * @param dataArray - A flat `Float32Array` containing 3D coordinates in the order [x0, y0, z0, x1, y1, z1, ...].
 * @param zIncreasingDownwards - Optional. If `true`, inverts the Z-axis direction to account for coordinate systems where Z increases downwards. Defaults to `false`.
 * @returns A tuple of six numbers: [minX, minY, minZ, maxX, maxY, maxZ], representing the minimum and maximum coordinates along each axis.
 */
export function computeBoundingBox(
    dataArray: Float32Array,
    zIncreasingDownwards: boolean = false
): BoundingBox3D {
    const bbox = buildBoundingBox(dataArray);
    if (zIncreasingDownwards) {
        // invert Z coordinates
        bbox[2] = -bbox[2];
        bbox[5] = -bbox[5];
    }
    return bbox;
}
