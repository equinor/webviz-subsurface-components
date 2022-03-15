const fsHillshading = `#define SHADER_NAME hillshading2d-shader

#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;

uniform sampler2D bitmapTexture; // Property map
uniform vec2 bitmapResolution;

uniform float valueRangeSize;

uniform vec3 lightDirection;
uniform float ambientLightIntensity;
uniform float diffuseLightIntensity;
uniform float opacity;

// Compute the normal value for every pixel, based on the current value and two values aroud it.
vec3 normal(float val) {
  vec2 dr = 1.0 / bitmapResolution;
  float p0 = valueRangeSize * val;
  float px = valueRangeSize * decode_rgb2float(texture2D(bitmapTexture, vTexCoord + vec2(1.0, 0.0) / bitmapResolution).rgb);
  float py = valueRangeSize * decode_rgb2float(texture2D(bitmapTexture, vTexCoord + vec2(0.0, 1.0) / bitmapResolution).rgb);
  vec3 dx = vec3(1.0, 0.0, px - p0);
  vec3 dy = vec3(0.0, 1.0, py - p0);

  return normalize(cross(dx, dy));
}

// Compute how much a pixel is in the shadow based on its normal and where the light comes from.
float shadow(vec3 normal) {
  float diffuse = diffuseLightIntensity * dot(normal, normalize(lightDirection));
  return clamp(ambientLightIntensity + diffuse, 0.0, 1.0);
}

void main(void) {
  vec4 bitmapColor = texture2D(bitmapTexture, vTexCoord);

  // If it's a picking pass, we just return the raw property map value.
  if (picking_uActive) {
    gl_FragColor = bitmapColor;
    return;
  }

  // Decode the RGB value into a float. See decoder.fs.glsl for more details.
  float val = decode_rgb2float(bitmapColor.rgb);
  // Compute the shadow value, how dark a pixel will be, 1 is in complete shadow, 0 is in complete light.
  float shadow = shadow(normal(val));

  // The final pixel is black, with the opacity based on the shadow value,
  // opacity 0 if pixel is completely in the light, opacity 1 if pixel is completely in the shadow.
  // The property map opacity (some portions of the property map can be transparent) and
  // the user provided image-wide opacity value are also taken into account.
  gl_FragColor = vec4(vec3(0.0), (1.0-shadow) * bitmapColor.a * opacity);

  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;

export default fsHillshading;
