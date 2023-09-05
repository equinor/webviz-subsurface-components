import { fs } from "./lighting.fs.glsl";
import { phongLighting } from "@luma.gl/shadertools";

export const localPhongLighting = {
    name: "localPhongLighting",
    fs,
    dependencies: [phongLighting],
};
