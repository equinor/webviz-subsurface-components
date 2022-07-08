const fsShader = `#version 300 es
#define SHADER_NAME terrainmap-shader

precision highp float;

uniform bool hasTexture;
uniform sampler2D sampler;
uniform bool flatShading;
uniform float opacity;

uniform bool isContoursDepth;

uniform float contourReferencePoint;
uniform float contourInterval;

in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;
in vec4 positions;

out vec4 fragColor;

in vec3 worldPos; // we export this from vertex shader (by injecting into it).

uniform sampler2D colormap;

uniform float valueRangeMin;
uniform float valueRangeMax;
uniform float colorMapRangeMin;
uniform float colorMapRangeMax;

uniform vec3 colorMapClampColor;
uniform bool isClampColor;
uniform bool isColorMapClampColorTransparent;


void main(void) {
   geometry.uv = vTexCoord;

   vec3 normal;
   if (flatShading) {
#ifdef DERIVATIVES_AVAILABLE
      normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
#else
      normal = vec3(0.0, 0.0, 1.0);
#endif
   } else {
      normal = normals_commonspace;
   }

   vec4 color = hasTexture ? texture(sampler, vTexCoord) : vColor;

   float texture_alpha = color.a;

   // Discard transparent pixels.
   if (!picking_uActive && color.w < 0.99) {
         discard;
         return;
   }

   // Picking pass.
   if (picking_uActive) {
      // Send texture coordinates.
      float s = vTexCoord.x;
      float t = vTexCoord.y;
      float b = texture_alpha > 0.95 ? 255.0 : 0.0;

      fragColor = vec4(s, t, b, 1.0);
      return;
   }

   float propertyValue = 0.0;
   if (hasTexture) {
      float opcacity = color.w;
      float floatScaler =  1.0 / (256.0 * 256.0 * 256.0 - 1.0);
      vec3 rgb = color.rgb;
      rgb *= vec3(16711680.0, 65280.0, 255.0); //255*256*256, 255*256, 255
      float propertyValue_norm = (rgb.r + rgb.g + rgb.b) * floatScaler; // propertyValue_norm will be in range [0-1]

      // If colorMapRangeMin/Max specified, color map will span this interval.
      propertyValue  = propertyValue_norm * (valueRangeMax - valueRangeMin) + valueRangeMin;
      float x = (propertyValue - colorMapRangeMin) / (colorMapRangeMax - colorMapRangeMin);
;
      if (x < 0.0 || x > 1.0) {
         // Out of range. Use clampcolor.
         if (isClampColor) {
            color = vec4(colorMapClampColor.rgb, 1.0);

         }
         else if (isColorMapClampColorTransparent) {
            discard;
            return;
         }
         else {
            // Use min/max color to clamp.
            x = max(0.0, x);
            x = min(1.0, x);

            color = texture2D(colormap, vec2(x, 0.5));
            color.a = opcacity;
         }
      }
      else {
         color = texture2D(colormap, vec2(x, 0.5));
         color.a = opcacity;
      }
   }

   bool is_contours = contourReferencePoint != -1.0 && contourInterval != -1.0;
   if (is_contours) {
      // Contours are made of either depths or properties.
      float val =  (hasTexture && !isContoursDepth) ? (propertyValue - contourReferencePoint) / contourInterval
                                                    : (abs(worldPos.z) - contourReferencePoint) / contourInterval;

      float f  = fract(val);
      float df = fwidth(val);

      // keep: float c = smoothstep(df * 1.0, df * 2.0, f); // smootstep from/to no of pixels distance fronm contour line.
      float c = smoothstep(0.0, df * 2.0, f);

      color = color * vec4(c, c, c, 1.0);
   }

   // Use normal lighting.
   vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
   fragColor = vec4(lightColor, color.a * opacity);

   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

export default fsShader;
