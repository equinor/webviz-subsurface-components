const fsShader = `#version 300 es
#define SHADER_NAME grid3d-fragment-shader

precision highp float;

in vec3 cameraPosition;
in vec4 position_commonspace;
flat in float property;
in float property_interpolated;

flat in vec3 normal;
flat in int vertexIndex;

uniform sampler2D colormap;

uniform float valueRangeMin;
uniform float valueRangeMax;
uniform float colorMapRangeMin;
uniform float colorMapRangeMax;

uniform bool  isColoringDiscrete;
uniform float colorMapSize;
uniform lowp int coloringMode;

uniform vec3 colorMapClampColor;
uniform bool isClampColor;
uniform bool isColorMapClampColorTransparent;

vec4 getContinuousPropertyColor (float propertyValue) {

   vec4 color = vec4(1.0, 1.0, 1.0, 1.0);

   float x = (propertyValue - colorMapRangeMin) / (colorMapRangeMax - colorMapRangeMin);
   if (x < 0.0 || x > 1.0) {
      // Out of range. Use clampcolor.
      if (isClampColor) {
         color = vec4(colorMapClampColor.rgb, 1.0);

      }
      else if (isColorMapClampColorTransparent) {
         discard;
      }
      else {
         // Use min/max color to clamp.
         x = clamp (x, 0.0, 1.0);         
         color = texture2D(colormap, vec2(x, 0.5));
      }
   }
   else {
      color = texture2D(colormap, vec2(x, 0.5));
   }
   return color;
}

// Calculate color from propertyValue using discrete colormap.
vec4 getDiscretePropertyColor (float propertyValue) {

   vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
   float tolerance = (1.0 / colorMapSize) * 0.5;

   if (propertyValue < colorMapRangeMin - tolerance || propertyValue > colorMapRangeMax + tolerance) {
      // Out of range. Use clampcolor.
      if (isClampColor) {
         color = vec4(colorMapClampColor.rgb, 1.0);

      }
      else if (isColorMapClampColorTransparent) {
         discard;
      }
      else {
         // Use min/max color to clamp.
         float p = clamp (propertyValue, colorMapRangeMin, colorMapRangeMax);
         float x = p / colorMapSize;
         color = texture2D(colormap, vec2(x, 0.5));
      }
   }
   else {
      float x = propertyValue / colorMapSize;
      color = texture2D(colormap, vec2(x + tolerance, 0.5));
   }
   return color;
}

vec4 getPropertyColor (float propertyValue) {
   if(isColoringDiscrete) {
      return getDiscretePropertyColor (propertyValue);
   }
   return getContinuousPropertyColor (propertyValue);
}

void main(void) {

   if (picking_uActive && !picking_uAttribute) {
      gl_FragColor = encodeVertexIndexToRGB(vertexIndex);      
      return;
   }
   
   // Property values other than X,Y or Z are passed as "flat" i.e. constant over faces.
   float propertyValue = coloringMode == 0 ? property : property_interpolated;
   propertyValue = clamp(propertyValue, valueRangeMin, valueRangeMax);

   vec4 color = getPropertyColor(propertyValue);
   
   // Use two sided phong lighting. This has no effect if "material" property is not set.
   vec3 lightColor = getPhongLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
   gl_FragColor = vec4(lightColor, 1.0);
   DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;

export default fsShader;
