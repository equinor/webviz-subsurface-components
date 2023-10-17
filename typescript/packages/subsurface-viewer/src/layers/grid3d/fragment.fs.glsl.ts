const fsShader = `#version 300 es
#define SHADER_NAME grid3d-fragment-shader

precision highp float;

in vec3 cameraPosition;
in vec4 position_commonspace;
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

   vec3 normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
   
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
   gl_FragColor = vec4(lightColor, 1.0);
   DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;

export default fsShader;
