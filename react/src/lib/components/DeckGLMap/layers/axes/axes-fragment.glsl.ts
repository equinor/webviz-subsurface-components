const fragmentShader = `#version 300 es
#define SHADER_NAME graph-layer-fragment-shader

precision highp float;

out vec4 fragColor;

uniform vec4 uColor;

void main(void) {
  fragColor = uColor;
}
`;

export default fragmentShader;
