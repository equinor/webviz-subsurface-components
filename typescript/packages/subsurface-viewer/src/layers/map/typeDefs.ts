// This type describes the mesh' extent in the horizontal plane.
export type MapFrame = {
    /** mesh origin
     */
    origin: [number, number];

    /** cells size in each direction.
     */
    increment: [number, number];

    /** number of nodes in each direction.
     */
    count: [number, number];

    /** Rotates map counterclockwise in degrees around 'rotPoint' specified below.
     */
    rotDeg?: number;

    /** Point to rotate around using 'rotDeg'. Defaults to mesh origin.
     */
    rotPoint?: [number, number];
};

/**
 * Enumerates possible coloring modes of Map Layer.
 */
export enum TMapColoringMode {
    /** A continuous property is provided to colorize the cell nodes. */
    Property,
    /** A discrete property is provided to colorize the cells. */
    DiscreteProperty,
    /** Coloring using the Z value of the cell nodes. */
    Z,
}

/**
 * Describes a discrete property value and its display name.
 */
export interface IMapDiscretePropertyValueName {
    /** Discrete property value represented. */
    value: number;
    /** Name for the discrete property value. */
    name: string;
}
// Internals
