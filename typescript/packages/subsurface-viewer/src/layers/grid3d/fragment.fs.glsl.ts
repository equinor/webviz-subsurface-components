const fsShader = `#version 300 es
#define SHADER_NAME terrainmap-shader

precision highp float;

in vec2 vTexCoord;
in vec3 cameraPosition;
//in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;

flat in int vertex_indexs_;

out vec4 fragColor;

in vec3 worldPos;
in float property;

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

   vec3 normal = vec3(0.0, 0.0, 1.0);
   bool nomals_available = false;
   if (!nomals_available) {
      normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
   } 
   
   //Picking pass.
   if (picking_uActive) {
      // Express triangle index in 255 system.
      float r = 0.0;
      float g = 0.0;
      float b = 0.0;
  
      int idx = vertex_indexs_;
  
      if (idx >= (256 * 256) - 1) {
         r = floor(float(idx) / (256.0 * 256.0));
         idx -= int(r * (256.0 * 256.0));
      }
  
      if (idx >= 256 - 1) {
         g = floor(float(idx) / 256.0);
         idx -= int(g * 256.0);
      }
  
      b = float(idx);
  
      fragColor = vec4(r / 255.0, g / 255.0, b / 255.0,  1.0);
      return;
   }

   // Calculate color from propertyValue using colormap.
   vec4 color = vec4(1.0, 1.0, 1.0,  1.0);;
   float propertyValue = property;
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

   // Use normal lighting. This has no effect if "material" property is not set.
   vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
   fragColor = vec4(lightColor, 1.0);

   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

export default fsShader;
