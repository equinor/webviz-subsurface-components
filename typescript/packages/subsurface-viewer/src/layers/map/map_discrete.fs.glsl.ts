export default `#version 300 es
#define SHADER_NAME map-discrete-fragment-shader


in vec2 vTexCoord;
in vec3 cameraPosition;
in vec4 position_commonspace;
in vec4 vColor;
in vec3 worldPos;

flat in uint property;
flat in int vertexIndex;

flat in vec3 vertexColor_;

out vec4 fragColor;


void main(void) {
   geometry.uv = vTexCoord;

   vec3 normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));

   uint propertyValue = property;

   vec4 color = vec4(vertexColor_, 1.0);


   bool is_contours = map_d.contourReferencePoint != -1.0 && map_d.contourInterval != -1.0;
   if (is_contours) {
      float val = map_d.isContoursDepth ? (abs(worldPos.z) - map_d.contourReferencePoint) / map_d.contourInterval
                                  : (float(propertyValue) - map_d.contourReferencePoint) / map_d.contourInterval;

      float f  = fract(val);
      float df = fwidth(val);

      // keep: float c = smoothstep(df * 1.0, df * 2.0, f); // smootstep from/to no of pixels distance from contour line.
      float c = smoothstep(0.0, df * 2.0, f);

      color = color * vec4(c, c, c, 1.0);
   }


   // Use two sided phong lighting. This has no effect if "material" property is not set.
   vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);

   fragColor = vec4(lightColor, vColor.a);
   DECKGL_FILTER_COLOR(fragColor, geometry);

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
}
`;
