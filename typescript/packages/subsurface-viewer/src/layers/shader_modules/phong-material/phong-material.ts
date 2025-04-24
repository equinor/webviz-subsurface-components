// luma.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Note: Copied this module from luma.gl.
// https://github.com/visgl/luma.gl branch 9.1-release
// Modified function "lighting_getLightColor" in file "phong-shaders-glsl.ts" to get two sided phong lighting.

import type { NumberArray3 } from "@math.gl/types";

import type { ShaderModule } from "@luma.gl/shadertools";
import { lighting } from "@luma.gl/shadertools";

import { PHONG_WGSL } from "./phong-shaders-wgsl";
import { PHONG_VS, PHONG_FS } from "./phong-shaders-glsl";

export type PhongMaterialProps = {
    ambient?: number;
    diffuse?: number;
    /** Specularity exponent */
    shininess?: number;
    specularColor?: NumberArray3;
};

/** In Phong shading, the normal vector is linearly interpolated across the surface of the polygon from the polygon's vertex normals. */
export const phongMaterial: ShaderModule<PhongMaterialProps> = {
    name: "phongMaterial",
    dependencies: [lighting],
    // Note these are switched between phong and gouraud
    source: PHONG_WGSL,
    vs: PHONG_VS,
    fs: PHONG_FS,
    defines: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        LIGHTING_FRAGMENT: true,
    },
    uniformTypes: {
        ambient: "f32",
        diffuse: "f32",
        shininess: "f32",
        specularColor: "vec3<f32>",
    },
    defaultUniforms: {
        ambient: 0.35,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [0.15, 0.15, 0.15],
    },
    getUniforms(props?: PhongMaterialProps) {
        const uniforms = { ...props };
        if (uniforms.specularColor) {
            uniforms.specularColor = uniforms.specularColor.map(
                (x) => x / 255
            ) as NumberArray3;
        }
        return { ...phongMaterial.defaultUniforms, ...uniforms };
    },
};
