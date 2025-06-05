export default `#version 300 es
#define SHADER_NAME axes-fragment-shader

precision highp float;

out vec4 fragColor;

uniform vec4 uColor;

void main(void) {
  fragColor = vec4(uColor.rgb, uColor.a * layer.opacity);
}
`;
