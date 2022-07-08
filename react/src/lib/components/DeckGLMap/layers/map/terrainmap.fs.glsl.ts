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

uniform sampler2D propertyTexture;
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

   vec4 color = vColor;

   vec4 texture_col = texture2D(propertyTexture, vTexCoord);
   float propertyValue = texture_col.r; // note this is a float texture with one channel (red)

   // Discard transparent pixels.
   if (!picking_uActive && isnan(propertyValue)) {
      discard;
      return;
   }

   // Picking pass.
   if (picking_uActive) {
      // Send texture coordinates.
      float s = vTexCoord.x;
      float t = vTexCoord.y;

      fragColor = vec4(s, t, 0.0, 1.0);
      return;
   }
  

   // If colorMapRangeMin/Max specified, color map will span this interval.
   float x = (propertyValue - colorMapRangeMin) / (colorMapRangeMax - colorMapRangeMin);
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
      }
   }
   else {
      color = texture2D(colormap, vec2(x, 0.5));
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
   fragColor = vec4(lightColor, 1.0);

   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

export default fsShader;
