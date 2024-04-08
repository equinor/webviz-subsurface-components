const fsShader = `#version 300 es
#define SHADER_NAME grid3d-fragment-shader

precision highp float;

in vec3 cameraPosition;
in vec4 position_commonspace;
in float property;

flat in int vertexIndex;

uniform sampler2D colormap;

uniform float colorMapRangeMin;
uniform float colorMapRangeMax;

uniform bool  isColoringDiscrete;
uniform float colorMapSize;

uniform vec3 colorMapClampColor;
uniform bool isClampColor;
uniform bool isColorMapClampColorTransparent;

// Calculate color from propertyValue using continuous colormap.
vec4 getContinuousPropertyColor (float propertyValue) {

   vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
   float x = (propertyValue - colorMapRangeMin) / (colorMapRangeMax - colorMapRangeMin);
   if (x < 0.0 - 1e-4 || x > 1.0 + 1e-4) {
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

   vec3 normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
      
   vec4 color = getPropertyColor(property);
   
   // Use two sided phong lighting. This has no effect if "material" property is not set.
   vec3 lightColor = getPhongLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
   gl_FragColor = vec4(lightColor, 1.0);
   DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;

export default fsShader;
