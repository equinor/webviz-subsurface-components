export default `#version 300 es
#define SHADER_NAME colormap-fragment-shader

in vec2 vTexCoord;

out vec4 fragColor;

uniform sampler2D bitmapTexture; // Property map
uniform sampler2D colormapTexture;
uniform sampler2D heightMapTexture; // Height map texture, if defined.

// Compute the normal value for every pixel, based on the current value and two values aroud it.
vec3 normal(float val) {
  vec2 dr = 1.0 / map.bitmapResolution;

  if (map.isHeightMapTextureDefined) {
    float valueRangeSize = map.heightValueRangeMax - map.heightValueRangeMin;
    float p0 = valueRangeSize * val;
    float px = valueRangeSize * decode_rgb2float(texture(heightMapTexture, vTexCoord + vec2(1.0, 0.0) / map.bitmapResolution).rgb);
    float py = valueRangeSize * decode_rgb2float(texture(heightMapTexture, vTexCoord + vec2(0.0, 1.0) / map.bitmapResolution).rgb);
    vec3 dx = vec3(1.0, 0.0, px - p0);
    vec3 dy = vec3(0.0, 1.0, py - p0);
    return normalize(cross(dx, dy));
  }
  else {
    float valueRangeSize = map.valueRangeMax - map.valueRangeMin;
    float p0 = valueRangeSize * val;
    float px = valueRangeSize * decode_rgb2float(texture(bitmapTexture, vTexCoord + vec2(1.0, 0.0) / map.bitmapResolution).rgb);
    float py = valueRangeSize * decode_rgb2float(texture(bitmapTexture, vTexCoord + vec2(0.0, 1.0) / map.bitmapResolution).rgb);
    vec3 dx = vec3(1.0, 0.0, px - p0);
    vec3 dy = vec3(0.0, 1.0, py - p0);
    return normalize(cross(dx, dy));
  }
}

// Compute how much a pixel is in the shadow based on its normal and where the light comes from.
float shadow(vec3 normal) {
  vec3 lightDirection = vec3(1.0, 1.0, 1.0);
  float ambientLightIntensity = 0.5;
  float diffuseLightIntensity = 0.5;
  float diffuse = diffuseLightIntensity * dot(normal, normalize(lightDirection));
  return clamp(ambientLightIntensity + diffuse, 0.0, 1.0);
}

void main(void) {
  vec4 bitmapColor = texture(bitmapTexture, vTexCoord);

  // If it's a picking pass, we just return the raw property map value.
  if (picking.isActive > 0.5) {
    fragColor = bitmapColor;
    return;
  }

  // Decode the RGB value into a float. See decoder.fs.glsl for more details.
  float val = decode_rgb2float(bitmapColor.rgb); // The resulting val will be in [0, 1] interval.
  float property = val * (map.valueRangeMax - map.valueRangeMin) + map.valueRangeMin;

  // Compute the color from the colormap.
  vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
  float x = (property - map.colormapRangeMin) / (map.colormapRangeMax - map.colormapRangeMin);
  if (x < 0.0 || x > 1.0) {
      // Out of range. Use clampcolor.
      if (map.isClampColor) {
         color = vec4(map.colormapClampColor.rgb, 1.0);
      }
      else if (map.isColormapClampColorTransparent) {
         discard;
         return;
      }
      else {
         // Use min/max color to clamp.
         x = max(0.0, x);
         x = min(1.0, x);

         color = texture(colormapTexture, vec2(x, 0.5));
      }
   }
   else {
      color = texture(colormapTexture, vec2(x, 0.5));
   }
   fragColor = vec4(color.rgb, color.a * bitmapColor.a * layer.opacity);

  // Hillshading.
  if (map.hillshading) {
    vec4 texture_val = map.isHeightMapTextureDefined ? texture(heightMapTexture, vTexCoord)
                                                     : texture(bitmapTexture, vTexCoord);
    float val =  decode_rgb2float(texture_val.rgb);

    // Compute the shadow value, how dark a pixel will be, 1 is in complete shadow, 0 is in complete light.
    float shadow = shadow(normal(val));
    fragColor = vec4(fragColor.rgb * shadow, fragColor.a);
  }

  // Contour lines.
  if (map.contours) {
      vec4 texture_val = map.isHeightMapTextureDefined ? texture(heightMapTexture, vTexCoord)
                                                       : texture(bitmapTexture, vTexCoord);
      float val =  decode_rgb2float(texture_val.rgb);
      float property = val * (map.heightValueRangeMax - map.heightValueRangeMin) + map.heightValueRangeMin;

      float x = (property - map.contourReferencePoint) / map.contourInterval;  
      float f  = fract(x);
      float df = fwidth(x);
      float c = smoothstep(df * 1.0, df * 2.0, f); // smootstep from/to no of pixels distance from contour line.  // keep: 
      fragColor = fragColor * vec4(c, c, c, layer.opacity);
  }

  geometry.uv = vTexCoord;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
