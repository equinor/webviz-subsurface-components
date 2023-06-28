export default `\
#version 300 es
#define SHADER_NAME axes2d-layer-fragment-shader

precision highp float;

uniform vec4 uColor;

out vec4 fragColor;

void main(void) {
  fragColor = uColor;
}
`;
