#version 300 es
#define SHADER_NAME terrainmap-shader

precision highp float;

uniform bool hasTexture;
uniform sampler2D sampler;
uniform bool flatShading;
uniform float opacity;

uniform float contourReferencePoint;
uniform float contourInterval;

in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;
in vec4 positions;

out vec4 fragColor;

in vec3 worldPos; // we export this from vertex shader (by injecting into it).

void main(void) {
   geometry.uv = vTexCoord;

   vec3 normal;
   if (flatShading) { // denne er true
#ifdef DERIVATIVES_AVAILABLE
      normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
#else
      normal = vec3(0.0, 0.0, 1.0);
#endif
   } else {
      normal = normals_commonspace;
   }

   vec4 color = hasTexture ? texture(sampler, vTexCoord) : vColor;

   // If it's a picking pass, we just return the raw texture value.
   if (picking_uActive) {
      fragColor = color;
      return;
   }

   if (hasTexture) {
      float op = color.w;
      float floatScaler =  1.0 / (256.0 * 256.0 * 256.0 - 1.0);
      vec3 rgb = color.rgb;
      rgb *= vec3(16711680.0, 65280.0, 255.0); //255*256*256, 255*256, 255
      float propertyValue = (rgb.r + rgb.g + rgb.b) * floatScaler;

      // temporary hardcoded colors.
      float r = 1.0 - propertyValue * 0.4;
      float g = 1.0 - propertyValue * 0.4;
      float b = 1.0 * propertyValue;
      color = vec4(r, g, b, op);
   }

   bool is_contours = contourReferencePoint != -1.0 && contourInterval != -1.0;
      if (is_contours) {
      float height =  (worldPos.z - contourReferencePoint) / contourInterval;

      float f  =  fract(height);
      float df = fwidth(height);

      // keep: float c = smoothstep(df * 1.0, df * 2.0, f); // smootstep from/to no of pixels distance fronm contour line.
      float c = smoothstep(0.0, df * 2.0, f);

      color = color * vec4(c, c, c, 1.0);
   }

   vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
   fragColor = vec4(lightColor, color.a * opacity);

   DECKGL_FILTER_COLOR(fragColor, geometry);
}