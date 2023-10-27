const fsShader = `#version 300 es
#define SHADER_NAME terrainmap-shader

precision highp float;

uniform bool isContoursDepth;
uniform float contourReferencePoint;
uniform float contourInterval;

in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec3 worldPos;
in float property;

uniform sampler2D colormap;
uniform vec4 uColor;
uniform bool smoothShading;

void main(void) {
   vec3 normal = normals_commonspace;

   if (!smoothShading) {
      normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
   } 

   vec4 color = uColor;
   bool is_contours = contourReferencePoint != -1.0 && contourInterval != -1.0;
   if (is_contours) {
      // Contours are made of either depths or properties.
      float val = (abs(worldPos.z) - contourReferencePoint) / contourInterval;

      float f  = fract(val);
      float df = fwidth(val);

      // keep: float c = smoothstep(df * 1.0, df * 2.0, f); // smootstep from/to no of pixels distance fronm contour line.
      float c = smoothstep(0.0, df * 2.0, f);

      color = color * vec4(c, c, c, 1.0);
   }

   // Use two sided phong lighting. This has no effect if "material" property is not set.
   vec3 lightColor = getPhongLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
   gl_FragColor = vec4(lightColor, 1.0);
   DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;

export default fsShader;
