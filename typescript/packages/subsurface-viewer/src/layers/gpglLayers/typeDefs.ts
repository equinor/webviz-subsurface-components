import type { Material as DeckGlMaterial } from "@deck.gl/core";

import type { RGBColor } from "../../utils/Color";

/**
 * Material properties for a graphical surface, used for lighting and shading.
 *
 * This type can either be an object specifying material properties,
 * or a boolean value.
 *
 * - If an object, it contains:
 *   - `ambient`: The ambient reflection coefficient.
 *   - `diffuse`: The diffuse reflection coefficient.
 *   - `shininess`: The shininess exponent for specular highlights.
 *   - `specularColor`: The RGB color of the specular reflection as a tuple of three numbers.
 *
 * - If a boolean, it may be used as a flag to enable default material or disable the lighting.
 */
export type Material =
    | {
          ambient?: number | undefined;
          diffuse?: number | undefined;
          shininess?: number | undefined;
          specularColor?: RGBColor | undefined;
      }
    | boolean;

export interface ValueArray2D {
    values: Float32Array;
    width: number;
    height: number;
}

// type checking. Make sure local Material type is equivalent to DeckGlMaterial
// https://github.com/microsoft/TypeScript/issues/27024#issuecomment-421529650
type Equals<X, Y> =
    (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
        ? true
        : false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const _test: Equals<Material, DeckGlMaterial> = true;
