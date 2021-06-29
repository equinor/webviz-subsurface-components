#define SHADER_NAME colormap-shader

#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;

uniform sampler2D bitmapTexture;
uniform sampler2D colormap;

uniform float opacity;

void main(void) {
  vec4 bitmapColor = texture2D(bitmapTexture, vTexCoord);

  if (picking_uActive) {
    gl_FragColor = bitmapColor;
    return;
  }

  float val = decode_rgb2float(bitmapColor.rgb);
  vec4 color = texture2D(colormap, vec2(val, 0.5));

  gl_FragColor = vec4(color.rgb, color.a * bitmapColor.a * opacity);

  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);

}