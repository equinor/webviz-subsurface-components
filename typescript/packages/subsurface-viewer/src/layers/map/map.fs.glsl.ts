export default `#version 300 es
#define SHADER_NAME map-fragment-shader

// Primitive attributes
in vec4 position_commonspace;
in float property;
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
float normalizeValue(float value) {
   if(isNanValue(value)) {
      return value;
   }
   return (value - map.colormapRange[0]) / (map.colormapRange[1] - map.colormapRange[0]);
}

vec4 valueColor(float value) {
   if(isNanValue(value) || value == map.undefinedValue) {
      return map.undefinedColor;
   }
   float normalizedValue = normalizeValue(value);
   // isNanValue(value) fails in shaders due to fragment interpolation,
   // but if the normalized value is out of the [0, 1] range, treat it as NaN.
   if(normalizedValue < -1.0 || normalizedValue > 2.0) {
      return map.undefinedColor;
   }
   if(map.useClampColor) {
      if(normalizedValue < 0.0 || normalizedValue > 1.0) {
         // Out of range. Use clampcolor.
         return map.colormapClampColor;
      }
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

   float propertyValue = property;

   // This may happen due to GPU interpolation precision causing color artifacts.
   // propertyValue = clamp(propertyValue, map.valueRange[0], map.valueRange[1]);

   vec4 color = vColor;   
   // compute color
   color = valueColor(propertyValue);

   bool is_contours = map.contourReferencePoint != -1.0 && map.contourInterval != -1.0;
   if (is_contours) {
      float val = map.isContoursDepth ? (abs(worldPos.z) - map.contourReferencePoint) / map.contourInterval
                                  : (propertyValue - map.contourReferencePoint) / map.contourInterval;

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
