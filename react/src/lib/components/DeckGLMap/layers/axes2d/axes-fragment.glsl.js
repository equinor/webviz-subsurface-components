export default `\
#version 300 es
#define SHADER_NAME graph-layer-fragment-shader

precision highp float;

out vec4 fragColor;

uniform sampler2D fontTexture;

in vec2 _vTexCoord;

void main(void) {
  vec4 color = texture(fontTexture, _vTexCoord);
  fragColor = color;
}
`;
