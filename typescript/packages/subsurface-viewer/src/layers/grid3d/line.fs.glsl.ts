export default `\
#version 300 es
#define SHADER_NAME grid3d-cell-lines-fragment-shader

in vec4 vColor;

out vec4 fragColor;

void main(void) {
  fragColor = vColor;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
