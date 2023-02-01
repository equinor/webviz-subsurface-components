export default `\
#version 300 es
#define SHADER_NAME graph-layer-fragment-shader

precision highp float;

out vec4 fragColor;

void main(void) {
  vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
  fragColor = color;
}
`;
