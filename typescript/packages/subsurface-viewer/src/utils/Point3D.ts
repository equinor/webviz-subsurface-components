/**
 * 3D point defined as [x, y, z].
 */
export type Point3D = [number, number, number];

/**
 * Adds two 3D points (vectors) component-wise.
 * @param a First point
 * @param b Second point
 * @returns The sum of the two points
 */
export function add(a: Point3D, b: Point3D): Point3D {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
