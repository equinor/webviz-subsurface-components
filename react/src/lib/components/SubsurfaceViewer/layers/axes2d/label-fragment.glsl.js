export default `\
#version 300 es
#define SHADER_NAME graph-layer-fragment-shader

precision highp float;

out vec4 fragColor;

uniform sampler2D fontTexture;

uniform vec4 uAxisColor;
uniform vec4 uBackGroundColor;

in vec2 _vTexCoord;

void main(void) {
  vec4 color = texture(fontTexture, _vTexCoord);
  
  float x = 1.0 - (color.r + color.g + color.b) / 3.0;  // intensity of text color

  float text_r = uAxisColor.r;
  float text_g = uAxisColor.g;
  float text_b = uAxisColor.b;

  float bg_r = uBackGroundColor.r;
  float bg_g = uBackGroundColor.g;
  float bg_b = uBackGroundColor.b;
  
  float r = x * text_r + (1.0 - x) * bg_r;
  float g = x * text_g + (1.0 - x) * bg_g;
  float b = x * text_b + (1.0 - x) * bg_b;

  fragColor = vec4(r, g, b, 1.0);
  return;
}
`;
