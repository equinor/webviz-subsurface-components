export default `\
#version 300 es
#define SHADER_NAME axes2d-line-fragment-shader

precision highp float;

out vec4 fragColor;

void main(void) {
  fragColor = vec4(lines.uColor.rgb, lines.uColor.a * layer.opacity);
}
`;
