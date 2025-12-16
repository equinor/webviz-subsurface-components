import type { ShaderModule } from "@luma.gl/shadertools";

import { PRECISION } from "./precisionForTests-shaders-glsl";

/** In Phong shading, the normal vector is linearly interpolated across the surface of the polygon from the polygon's vertex normals. */
export const precisionForTests: ShaderModule = {
    name: "precisionForTests",
    vs: PRECISION,
    fs: PRECISION,
};
