import { fs } from "./lighting.fs.glsl";
import { phongMaterial, lighting } from "@luma.gl/shadertools";

export const localPhongLighting = {
    name: "localPhongLighting",
    fs,
    dependencies: [phongMaterial, lighting],
};
