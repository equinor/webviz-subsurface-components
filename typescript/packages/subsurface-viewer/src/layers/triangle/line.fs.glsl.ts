export default `\
#version 300 es
#define SHADER_NAME triangle-lines-fragment-shader

precision highp float;

in vec4 vColor;

out vec4 fragColor;

void main(void) {

  // Picking pass.
  if (picking.isActive > 0.5) {
    discard;
    return;
  }

  fragColor = vColor;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
