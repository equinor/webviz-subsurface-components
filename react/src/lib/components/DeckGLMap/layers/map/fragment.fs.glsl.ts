const fsShader = `#version 300 es
#define SHADER_NAME terrainmap-shader

precision highp float;


uniform bool isContoursDepth;
uniform float contourReferencePoint;
uniform float contourInterval;

in vec2 vTexCoord;
in vec3 cameraPosition;
//in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;

flat in int vertex_indexs_;

out vec4 fragColor;

in vec3 worldPos;
in float property;

void main(void) {
   geometry.uv = vTexCoord;

   vec3 normal = vec3(0.0, 0.0, 1.0);
   bool nomals_available = false;
   if (!nomals_available) {
      normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
   } 
   // else {
   //    normal = normals_commonspace;
   // }

   vec4 color = vColor;

   float propertyValue = property;

   // // Discard transparent pixels. KEEP
   // if (!picking_uActive && isnan(propertyValue)) {
   //    discard;
   //    return;
   // }

   //Picking pass.
   if (picking_uActive) {
      // Express triangle index in 255 system.
      float r = 0.0;
      float g = 0.0;
      float b = 0.0;
  
      int idx = vertex_indexs_;
  
      if (idx >= (256 * 256) - 1) {
         r = floor(float(idx) / (256.0 * 256.0));
         idx -= int(r * (256.0 * 256.0));
      }
  
      if (idx >= 256 - 1) {
         g = floor(float(idx) / 256.0);
         idx -= int(g * 256.0);
      }
  
      b = float(idx);
  
      fragColor = vec4(r / 255.0, g / 255.0, b / 255.0,  1.0);
      return;
   }
  
   bool is_contours = contourReferencePoint != -1.0 && contourInterval != -1.0;
   if (is_contours) {
      // Contours are made of either depths or properties.
      float val = isContoursDepth ? (abs(worldPos.z) - contourReferencePoint) / contourInterval
                                  : (propertyValue - contourReferencePoint) / contourInterval;

      float f  = fract(val);
      float df = fwidth(val);

      // keep: float c = smoothstep(df * 1.0, df * 2.0, f); // smootstep from/to no of pixels distance fronm contour line.
      float c = smoothstep(0.0, df * 2.0, f);

      color = color * vec4(c, c, c, 1.0);
   }

   // Use normal lighting.
   vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
   fragColor = vec4(lightColor, 1.0);

   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

export default fsShader;
