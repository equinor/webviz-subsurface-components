const fsShader = `#version 300 es
#define SHADER_NAME terrainmap-shader

precision highp float;

uniform bool hasTexture;
uniform sampler2D sampler;
uniform bool flatShading;
uniform float opacity;

uniform bool isReadoutDepth;
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

   float propertyValue = 0.0; // XXX this must be fixed.

   // Discard transparent pixels.
   if (!picking_uActive && color.w < 0.99) {
         discard;
         return;
   }

   // Picking pass.
   if (picking_uActive) {
      if (isReadoutDepth) {
         // Readout should not be surface height (z value).
         float depth = abs(worldPos.z);
         
         // Express in 255 system.
         float r = 0.0;
         float g = 0.0;
         float b = 0.0;

         if (depth >= (256.0 * 256.0) - 1.0) {
            r = floor(depth / (256.0 * 256.0));
            depth -= r * (256.0 * 256.0);
         }

         if (depth >= 256.0 - 1.0) {
            g = floor(depth / 256.0);
            depth -= g * 256.0;
         }

         b = floor(depth);

         fragColor = vec4(r / 255.0, g / 255.0, b / 255.0,  1.0);
      }
      else {
         // Readout should be surface property.
         // Send texture coordinates.
         float s = vTexCoord.x;
         float t = vTexCoord.y;

         fragColor = vec4(s, t, 0.0, 1.0);
      }

      return;
   }

   bool is_contours = contourReferencePoint != -1.0 && contourInterval != -1.0;
   if (is_contours) {
      // Contours are made of either depths or properties.
      float val = isContoursDepth ? (abs(worldPos.z) - contourReferencePoint) / contourInterval
                                  : (propertyValue - contourReferencePoint) / contourInterval;

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
