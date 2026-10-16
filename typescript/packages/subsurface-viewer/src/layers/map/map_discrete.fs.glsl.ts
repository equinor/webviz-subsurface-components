export default `#version 300 es
#define SHADER_NAME map-discrete-fragment-shader

// Primitive attributes
in vec4 position_commonspace;
flat in uint property;
in vec3 normals_commonspace;
in vec4 vColor;

in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 worldPos;

flat in int vertexIndex;

// Uniforms
uniform sampler2D colormap;

// Outputs
out vec4 fragColor;

// Normalize the value to the range [0, 1]
float normalizeValue(uint value) {
   return (float(value) - map.colormapRange[0]) / (map.colormapRange[1] - map.colormapRange[0]);
}

vec4 valueColor(uint value) {
   if(value == map.undefinedValue) {
      return map.undefinedColor;
   }
   float normalizedValue = normalizeValue(value);

   if(map.useClampColor) {
      // if(normalizedValue < map.colormapRange[0] || normalizedValue > map.colormapRange[1]) {
      //    // Out of range. Use clampcolor.
      //    return map.colormapClampColor;
      // }
   }
   // apply colormap
   return texture(colormap, vec2(normalizedValue, 0.5));
}


void main(void) {
   geometry.uv = vTexCoord;

   vec3 normal = normals_commonspace;

   if(!map.smoothShading || (normal[0] == 0.0 && normal[1] == 0.0 && normal[2] == 0.0)) {
      normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
   }

   uint propertyValue = property;
   
   // Below code is modified version of "picking_filterPickingColor" function.
   // Original function is in deckgl's shader modules/picking.glsl.ts
   // "GetPickingInfo" retrieves this color as "pickingColor" on the JS side.
   // Encodes vertexIndex and is used to retrieve picked info from input data.
   if ( bool(picking.isActive) && !bool(picking.isAttribute) ) {
      if (picking_vRGBcolor_Avalid.a == 0.0) {
          discard;
      }
      vec4 encodedProperty = encodeIndexToRGB(int(propertyValue));
      fragColor = vec4(encodedProperty.rgb, picking_vRGBcolor_Avalid.a);
   }
  
   vec4 color = vColor;
   // compute color
   color = valueColor(propertyValue);

   bool is_contours = map.contourReferencePoint != -1.0 && map.contourInterval != -1.0;
   if (is_contours) {
      float val = map.isContoursDepth ? (abs(worldPos.z) - map.contourReferencePoint) / map.contourInterval
                                  : (float(propertyValue) - map.contourReferencePoint) / map.contourInterval;

      float f  = fract(val);
      float df = fwidth(val);

      // keep: float c = smoothstep(df * 1.0, df * 2.0, f); // smootstep from/to no of pixels distance from contour line.
      float c = smoothstep(0.0, df * 2.0, f);

      color = color * vec4(c, c, c, 1.0);
   }

   // Use two sided phong lighting. This has no effect if "material" property is not set.
   vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);

   fragColor = vec4(lightColor, color.a * vColor.a);
   DECKGL_FILTER_COLOR(fragColor, geometry);

}
`;
