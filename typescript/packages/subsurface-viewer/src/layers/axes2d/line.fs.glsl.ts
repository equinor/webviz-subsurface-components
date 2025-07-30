export default `\
#version 300 es
#define SHADER_NAME axes2d-line-fragment-shader

out vec4 fragColor;

void main(void) {
  fragColor = lines.uColor;
}
`;
