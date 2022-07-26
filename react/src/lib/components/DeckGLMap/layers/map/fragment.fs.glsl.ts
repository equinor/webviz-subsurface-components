const fsShader = `#version 300 es
#define SHADER_NAME terrainmap-shader

precision highp float;


uniform bool isContoursDepth;
uniform float contourReferencePoint;
uniform float contourInterval;
uniform sampler2D propertyTexture;

in vec2 vTexCoord;
in vec3 cameraPosition;
// in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;

out vec4 fragColor;

in vec3 worldPos;

void main(void) {
   geometry.uv = vTexCoord;

   vec3 normal = vec3(0.0, 0.0, 1.0);
   if (true) {
#ifdef DERIVATIVES_AVAILABLE
      normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
#endif
   }
   // } else {
   //    normal = normals_commonspace;
   // }

   vec4 color = vColor;

   vec4 texture_col = texture2D(propertyTexture, vTexCoord);
   float propertyValue = texture_col.r; // note this is a float texture with one channel (red)

   // // Discard transparent pixels. KEEP
   // if (!picking_uActive && isnan(propertyValue)) {
   //    discard;
   //    return;
   // }

   //Picking pass.
   if (picking_uActive) {
      // Send texture coordinates.
      float s = vTexCoord.x;
      float t = vTexCoord.y;

      fragColor = vec4(s, t, 0.0, 1.0);
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
