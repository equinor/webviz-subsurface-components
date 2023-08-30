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

out vec4 fragColor;

uniform sampler2D colormap;
uniform vec4 uColor;
uniform bool smoothShading;

void main(void) {
   //geometry.uv = vTexCoord;

   vec3 normal = normals_commonspace;

   if (!smoothShading) {
      normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
   } 
   
   //Picking pass.
   if (picking_uActive) {
      // Readout is surface height (z value).
      float range = 10000.0;  // May represent depths in range 0 - 10000 meter.

      // Express in 255 system.
      float depth = abs(worldPos.z);
      float depthScaled = (256.0 * 256.0 * 256.0) * (depth / range); // scaled to within max range in 256 system.

      float r = 0.0;
      float g = 0.0;
      float b = 0.0;

      if (depthScaled >= (256.0 * 256.0) - 1.0) {
         r = floor(depthScaled / (256.0 * 256.0));
         depthScaled -= r * (256.0 * 256.0);
      }

      if (depthScaled >= 256.0 - 1.0) {
         g = floor(depthScaled / 256.0);
         depthScaled -= g * 256.0;
      }

      b = floor(depthScaled);

      fragColor = vec4(r / 255.0, g / 255.0, b / 255.0,  1.0);
      return;
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

   // Use normal lighting. This has no effect if "material" property is not set.
   vec3 lightColor = getPhongLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
   fragColor = vec4(lightColor, 1.0);

   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

export default fsShader;
