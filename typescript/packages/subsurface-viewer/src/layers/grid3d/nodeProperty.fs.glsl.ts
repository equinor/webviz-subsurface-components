export default `\
#version 300 es
#define SHADER_NAME grid3d-node-fragment-shader

in vec3 cameraPosition;
in vec4 position_commonspace;
in float property;
in vec4 vColor;

flat in vec3 normal;
flat in int vertexIndex;

out vec4 fragColor;

uniform sampler2D colormap;

// Normalize the value to the range [0, 1]
float normalizeValue(float value) {
   return (value - grid.colormapRange[0]) / (grid.colormapRange[1] - grid.colormapRange[0]);
}

vec4 valueColor(float value) {
   if(grid.isColoringDiscrete) {
      if(isNanValue(value) || round(value) == round(grid.undefinedValue)) {
         return grid.undefinedColor;
      }
   } else {
      if(isNanValue(value) || value == grid.undefinedValue) {
         return grid.undefinedColor;
      }
   }
   float normalizedValue = normalizeValue(value);
   if(grid.useClampColor) {
      if(normalizedValue < 0.0 || normalizedValue > 1.0) {
         // Out of range. Use clampcolor.
         return grid.colormapClampColor;
      }
   }
   // apply colormap
   return texture(colormap, vec2(normalizedValue, 0.5));
}


void main(void) {

   // compute color
   vec4 color = valueColor(property);
   if( color[3] == 0.0 ) {
      discard;
   }

   // Use two sided phong lighting. This has no effect if "material" property is not set.
   vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);

   fragColor = vec4(lightColor, color.a * vColor.a);
   DECKGL_FILTER_COLOR(fragColor, geometry);

   // Below code is modified version of "picking_filterPickingColor" function.
   // Original function is in deckgl's shader modules/picking.glsl.ts
   // "GetPickingInfo" retrieves this color as "pickingColor" on the JS side.
   // Encodes vertexIndex and is used to retrieve picked info from input data.
   if ( bool(picking.isActive) && !bool(picking.isAttribute) ) {
      if (picking_vRGBcolor_Avalid.a == 0.0) {
          discard;
      }
      vec4 encodedIndexColor = encodeIndexToRGB(vertexIndex);
      fragColor = vec4(encodedIndexColor.rgb, picking_vRGBcolor_Avalid.a);
   }
}
`;
