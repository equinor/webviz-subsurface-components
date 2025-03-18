const fsShader = `\
#version 300 es
#define SHADER_NAME grid3d-cell-fragment-shader

in vec3 cameraPosition;
in vec4 position_commonspace;

flat in vec3 normal;
flat in int vertexIndex;
flat in float property;

out vec4 fragColor;

uniform sampler2D colormap;

uniform float valueRangeMin;
uniform float valueRangeMax;
uniform float colorMapRangeMin;
uniform float colorMapRangeMax;

uniform bool isColoringDiscrete;
uniform float colorMapSize;

uniform vec4 colorMapClampColor;
uniform bool isClampColor;
uniform vec3 undefinedPropertyColor;


// Calculate color from propertyValue using discrete colormap.
vec4 getDiscretePropertyColor (float propertyValue) {
   vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
   // On some machines (like in docker container), float comparison and texture lookup may fail due to precision.
   // Use this tolerance for comparison and to shift the lookup position.
   float tolerance = (1.0 / colorMapSize) * 0.5;

   if (propertyValue < colorMapRangeMin - tolerance || propertyValue > colorMapRangeMax + tolerance) {
      // Out of range. Use clampcolor.
      if (isClampColor) {
         color = colorMapClampColor;
         if( color[3] == 0.0 ) {
            discard;
         }
      }
      else {
         // Use min/max color to clamp.
         float p = clamp (propertyValue, colorMapRangeMin, colorMapRangeMax);
         float x = p / colorMapSize;
         color = texture(colormap, vec2(x + tolerance, 0.5));
      }
   }
   else {
      float x = propertyValue / colorMapSize;
      color = texture(colormap, vec2(x + tolerance, 0.5));
   }
      
   return color;
}

vec4 getContinuousPropertyColor (float propertyValue) {
   vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
   float normalizedValue = (propertyValue - colorMapRangeMin) / (colorMapRangeMax - colorMapRangeMin);
   if (normalizedValue < 0.0 || normalizedValue > 1.0) {
      // Out of range. Use clampcolor.
      if (isClampColor) {
         color = colorMapClampColor;
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
      vec3 lightColor = getPhongLightColor(undefinedPropertyColor.rgb, cameraPosition, position_commonspace.xyz, normal);
      fragColor = vec4(lightColor, 1.0);
      DECKGL_FILTER_COLOR(fragColor, geometry);
      return;
   } 

   // This may happen due to GPU interpolation precision causing color artifacts.
   float propertyValue = clamp(property, valueRangeMin, valueRangeMax);

   vec4 color = isColoringDiscrete ? getDiscretePropertyColor(round(propertyValue)) : getContinuousPropertyColor(propertyValue);

   // Use two sided phong lighting. This has no effect if "material" property is not set.
   vec3 lightColor = getPhongLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
   fragColor = vec4(lightColor, 1.0);
   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

export default fsShader;
