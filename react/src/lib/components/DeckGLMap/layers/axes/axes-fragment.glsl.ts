const fragmentShader = `#version 300 es
#define SHADER_NAME graph-layer-fragment-shader

precision highp float;

out vec4 fragColor;

void main(void) {
  fragColor = vec4(0.0, 0.0, 0.0,   1.0);
}
`;

export default fragmentShader;
