export default `\
#version 300 es
#define SHADER_NAME grid3d-node-fragment-shader

in vec3 cameraPosition;
in vec4 position_commonspace;
in float property;

flat in vec3 normal;
flat in int vertexIndex;

out vec4 fragColor;

uniform sampler2D colormap;

vec4 getPropertyColor (float propertyValue) {
   vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
   float normalizedValue = (propertyValue - grid.colorMapRangeMin) / (grid.colorMapRangeMax - grid.colorMapRangeMin);
   if (normalizedValue < 0.0 || normalizedValue > 1.0) {
      // Out of range. Use clampcolor.
      if (grid.isClampColor) {
         color = grid.colorMapClampColor;
         if( color[3] == 0.0 ) {
            discard;
         }
      }
      else {
         // Use min/max color to clamp.
         normalizedValue = clamp (normalizedValue, 0.0, 1.0);         
         color = texture(colormap, vec2(normalizedValue, 0.5));
      }
   }
   else {
      color = texture(colormap, vec2(normalizedValue, 0.5));
   }
   return color;
}


void main(void) {
   if (picking.isActive > 0.5 && !(picking.isAttribute > 0.5)) {
      fragColor = encodeVertexIndexToRGB(vertexIndex);      
      return;
   }
       
   // This may happen due to GPU interpolation precision causing color artifacts.
   float propertyValue = clamp(property, grid.valueRangeMin, grid.valueRangeMax);

   vec4 color = getPropertyColor(propertyValue);

   // Use two sided phong lighting. This has no effect if "material" property is not set.
   vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
   fragColor = vec4(lightColor, 1.0);
   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
