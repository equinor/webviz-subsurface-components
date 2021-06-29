#define SHADER_NAME hillshading2d-shader

#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;

uniform sampler2D bitmapTexture;
uniform vec2 bitmapResolution;

uniform float valueRangeSize;

uniform vec3 lightDirection;
uniform float ambientLightIntensity;
uniform float diffuseLightIntensity;
uniform float opacity;

vec3 normal(float val) {
  vec2 dr = 1.0 / bitmapResolution;
  float p0 = valueRangeSize * val;
  float px = valueRangeSize * decode_rgb2float(texture2D(bitmapTexture, vTexCoord + vec2(1.0, 0.0) / bitmapResolution).rgb);
  float py = valueRangeSize * decode_rgb2float(texture2D(bitmapTexture, vTexCoord + vec2(0.0, 1.0) / bitmapResolution).rgb);
  vec3 dx = vec3(1.0, 0.0, px - p0);
  vec3 dy = vec3(0.0, 1.0, py - p0);

  return normalize(cross(dx, dy));
}

float shadow(vec3 normal) {
  float diffuse = diffuseLightIntensity * dot(normal, normalize(lightDirection));
  return clamp(ambientLightIntensity + diffuse, 0.0, 1.0);
}

void main(void) {
  vec4 bitmapColor = texture2D(bitmapTexture, vTexCoord);

  if (picking_uActive) {
    gl_FragColor = bitmapColor;
    return;
  }

  float val = decode_rgb2float(bitmapColor.rgb);
  float shadow = shadow(normal(val));

  gl_FragColor = vec4(vec3(0.0), (1.0-shadow) * bitmapColor.a * opacity);

  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}