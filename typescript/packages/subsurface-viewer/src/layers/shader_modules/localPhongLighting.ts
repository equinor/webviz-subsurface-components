import { fs } from "./lighting.fs.glsl";
import { phongLighting } from "@luma.gl/shadertools";

export default {
    name: "localPhongLighting",
    fs,
    dependencies: [phongLighting],
};
