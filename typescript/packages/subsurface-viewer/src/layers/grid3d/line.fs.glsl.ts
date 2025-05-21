export default `\
#version 300 es
#define SHADER_NAME grid3d-cell-lines-fragment-shader

precision highp float;

out vec4 fragColor;

void main(void) {
  fragColor = vec4(0.0, 0.0, 0.0, 1.0);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
