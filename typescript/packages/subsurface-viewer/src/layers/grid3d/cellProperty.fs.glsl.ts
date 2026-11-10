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
vec4 discreteValueColor(float propertyValue) {
   // On some machines (like in docker container), float comparison and texture lookup may fail due to precision.
   // Use this tolerance for comparison and to shift the lookup position.
   float tolerance = (1.0 / grid.colormapSize) * 0.5;

   if (propertyValue < grid.colormapRange[0] - tolerance || propertyValue > grid.colormapRange[1] + tolerance) {
      // Out of range. Use clampcolor.
      if (grid.useClampColor) {
         return grid.colormapClampColor;
      }
      else {
         // Use min/max color to clamp.
         propertyValue = clamp (propertyValue, grid.colormapRange[0], grid.colormapRange[1]);
      }
   }

   float x = propertyValue / grid.colormapSize;
   return texture(colormap, vec2(x + tolerance, 0.5));
}


// Normalize the value to the range [0, 1]
float normalizeValue(float value) {
   return (value - grid.colormapRange[0]) / (grid.colormapRange[1] - grid.colormapRange[0]);
}

vec4 continuousValueColor(float value) {
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

vec4 valueColor(float value) {
   if(isNanValue(value) || round(value) == round(grid.undefinedValue)) {
      return grid.undefinedColor;
   }
   if(grid.isColoringDiscrete) {
      return discreteValueColor(round(value));
   }
   else {
      return continuousValueColor(value);
   }
}

void main(void) {
   // This may happen due to GPU interpolation precision causing color artifacts.
   // property = clamp(property, grid.valueRange[0], grid.valueRange[1]);

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
