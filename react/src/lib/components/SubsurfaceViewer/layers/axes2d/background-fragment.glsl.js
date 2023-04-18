export default `\
#version 300 es
#define SHADER_NAME graph-layer-fragment-shader

precision highp float;

uniform vec4 uBackGroundColor;

out vec4 fragColor;

void main(void) {
  vec4 color = uBackGroundColor;
  fragColor = color;
}
`;
