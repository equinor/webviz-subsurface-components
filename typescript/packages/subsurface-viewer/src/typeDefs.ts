import type { Layer } from "@deck.gl/core";

export type LightsType = {
    headLight?: {
        intensity: number;
        color?: [number, number, number]; // RGBColor;
    };

    ambientLight?: {
        intensity: number;
        color?: [number, number, number]; // RGBColor;
    };

    pointLights?: Array<{
        intensity: number;
        position: [number, number, number]; // Point3D;
        color?: [number, number, number]; // RGBColor;
    }>;

    directionalLights?: Array<{
        intensity: number;
        direction: [number, number, number]; // Point3D;
        color?: [number, number, number]; // RGBColor;
    }>;
};

export type TLayerDefinition =
    | Record<string, unknown>
    | Layer
    | false
    | null
    | undefined;
