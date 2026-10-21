import type { GeometryProps } from "@luma.gl/engine";

/**
 * Enumerates possible coloring modes of Grid3D Layer.
 */
export enum TGrid3DColoringMode {
    /** A continuous property is provided to colorize the cells nodes. */
    Property,
    /** A discrete property is provided to colorize the cells. */
    DiscreteProperty,
    /** Coloring using the X value of the cell nodes. */
    X,
    /** Coloring using the Y value of the cell nodes. */
    Y,
    /** Coloring using the Z value of the cell nodes. */
    Z,
}

/**
 * Describes a discrete property value and its display name and optional color.
 */
export interface IGrid3DDiscretePropertyValueName {
    /** Discrete property value represented. */
    value: number;
    /** Name for the discrete property value. */
    name: string;
}

// Internals
export type MeshType = {
    drawMode: GeometryProps["topology"];
    attributes: {
        positions: { value: Float32Array; size: number };
        TEXCOORD_0?: { value: Float32Array; size: number };
        normals: { value: Float32Array; size: number };
        properties?: { value: Float32Array; size: number };
    };
    vertexCount: number;
};

export type MeshTypeLines = {
    drawMode: GeometryProps["topology"];
    topology: GeometryProps["topology"];
    attributes: {
        positions: { value: Float32Array; size: number };
        indices: { value: Uint32Array; size: number };
    };
    vertexCount: number;
};
