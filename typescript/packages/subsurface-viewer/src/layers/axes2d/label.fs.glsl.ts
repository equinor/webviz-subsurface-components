export default `\
#version 300 es
#define SHADER_NAME axes2d-label-fragment-shader

precision highp float;

out vec4 fragColor;

uniform sampler2D fontTexture;

in vec2 _vTexCoord;

void main(void) {
  vec4 color = texture(fontTexture, _vTexCoord);
  
  float x = 1.0 - (color.r + color.g + color.b) / 3.0;  // intensity of text color
  x = smoothstep(0.0, 0.2, x);  

  float text_r = axes.uAxisColor.r;
  float text_g = axes.uAxisColor.g;
  float text_b = axes.uAxisColor.b;

  float bg_r = axes.uBackGroundColor.r;
  float bg_g = axes.uBackGroundColor.g;
  float bg_b = axes.uBackGroundColor.b;
  
  float r = x * text_r + (1.0 - x) * bg_r;
  float g = x * text_g + (1.0 - x) * bg_g;
  float b = x * text_b + (1.0 - x) * bg_b;

  fragColor = vec4(r, g, b, 1.0);
}
`;
