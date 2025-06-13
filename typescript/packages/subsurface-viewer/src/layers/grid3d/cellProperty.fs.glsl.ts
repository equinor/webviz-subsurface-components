export default `\
#version 300 es
#define SHADER_NAME grid3d-cell-fragment-shader

in vec3 cameraPosition;
in vec4 position_commonspace;
in vec4 vColor;

flat in vec3 normal;
flat in int vertexIndex;
flat in float property;

out vec4 fragColor;

uniform sampler2D colormap;

// Calculate color from propertyValue using discrete colormap.
vec4 getDiscretePropertyColor (float propertyValue) {
   vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
   // On some machines (like in docker container), float comparison and texture lookup may fail due to precision.
   // Use this tolerance for comparison and to shift the lookup position.
   float tolerance = (1.0 / grid.colormapSize) * 0.5;

   if (propertyValue < grid.colormapRangeMin - tolerance || propertyValue > grid.colormapRangeMax + tolerance) {
      // Out of range. Use clampcolor.
      if (grid.isClampColor) {
         color = grid.colormapClampColor;
         if( color[3] == 0.0 ) {
            discard;
         }
      }
      else {
         // Use min/max color to clamp.
         float p = clamp (propertyValue, grid.colormapRangeMin, grid.colormapRangeMax);
         float x = p / grid.colormapSize;
         color = texture(colormap, vec2(x + tolerance, 0.5));
      }
   }
   else {
      float x = propertyValue / grid.colormapSize;
      color = texture(colormap, vec2(x + tolerance, 0.5));
   }
      
   return color;
}

vec4 getContinuousPropertyColor (float propertyValue) {
   vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
   float normalizedValue = (propertyValue - grid.colormapRangeMin) / (grid.colormapRangeMax - grid.colormapRangeMin);
   if (normalizedValue < 0.0 || normalizedValue > 1.0) {
      // Out of range. Use clampcolor.
      if (grid.isClampColor) {
         color = grid.colormapClampColor;
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

   if (isnan(property)) {
      vec3 lightColor = lighting_getLightColor(grid.undefinedPropertyColor.rgb, cameraPosition, position_commonspace.xyz, normal);
      fragColor = vec4(lightColor, vColor.a);
      DECKGL_FILTER_COLOR(fragColor, geometry);
      return;
   }

   // This may happen due to GPU interpolation precision causing color artifacts.
   float propertyValue = clamp(property, grid.valueRangeMin, grid.valueRangeMax);
      
   vec4 color = grid.isColoringDiscrete ? getDiscretePropertyColor(round(propertyValue)) : getContinuousPropertyColor(propertyValue);

   // Use two sided phong lighting. This has no effect if "material" property is not set.
   vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
   fragColor = vec4(lightColor, vColor.a);
   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
