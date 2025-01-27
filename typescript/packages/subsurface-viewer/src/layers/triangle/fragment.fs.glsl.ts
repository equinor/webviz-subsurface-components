const fsShader = `#version 300 es
#define SHADER_NAME triangle-fragment-shader

precision highp float;

in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec3 worldPos;
in float property;

out vec4 fragColor;

void main(void) {
   vec3 normal = normals_commonspace;

   if (!layer.smoothShading) {
      normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
   } 

   vec4 color = layer.uColor;
   bool is_contours = layer.contourReferencePoint != -1.0 && layer.contourInterval != -1.0;
   if (is_contours) {
      // Contours are made of either depths or properties.
      float val = (abs(worldPos.z) - layer.contourReferencePoint) / layer.contourInterval;

      float f  = fract(val);
      float df = fwidth(val);

      // keep: float c = smoothstep(df * 1.0, df * 2.0, f); // smootstep from/to no of pixels distance fronm contour line.
      float c = smoothstep(0.0, df * 2.0, f);

      color = color * vec4(c, c, c, 1.0);
   }

   // Use two sided phong lighting. This has no effect if "material" property is not set.
   vec3 lightColor = getPhongLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
   fragColor = vec4(lightColor, 1.0);
   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

export default fsShader;
