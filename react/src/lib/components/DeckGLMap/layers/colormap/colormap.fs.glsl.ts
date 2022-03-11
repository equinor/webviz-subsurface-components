const fsColormap = `#define SHADER_NAME colormap-shader

#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;

uniform sampler2D bitmapTexture; // Property map
uniform sampler2D colormap;

uniform float opacity;

void main(void) {
  vec4 bitmapColor = texture2D(bitmapTexture, vTexCoord);

  // If it's a picking pass, we just return the raw property map value.
  if (picking_uActive) {
    gl_FragColor = bitmapColor;
    return;
  }

  // Decode the RGB value into a float. See decoder.fs.glsl for more details.
  float val = decode_rgb2float(bitmapColor.rgb);
  // The resulting val will be in [0, 1] interval, so we can use it directly as a texture coord
  // to sample from the colormap.
  // 0 => Leftmost color in the colormap, 1 => rightmost color, linearly interpolated in between.
  vec4 color = texture2D(colormap, vec2(val, 0.5));

  // The final pixel opacity is the combination of the user provided image-wide opacity,
  // the colormap opacity at the sampled pixel and the property map opacity of the sampled pixel.
  gl_FragColor = vec4(color.rgb, color.a * bitmapColor.a * opacity);

  // Support for existing functionality that comes from the BitmapLayer, such as desaturate, tintColor etc.
  // See https://deck.gl/docs/api-reference/layers/bitmap-layer#render-options for more details.
  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);

}
`;

export default fsColormap;
