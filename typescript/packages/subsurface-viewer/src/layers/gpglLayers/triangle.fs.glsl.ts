export default `#version 300 es
#define SHADER_NAME texture-fragment-shader

precision highp float;

in vec3 cameraPosition;

in vec4 vPosition;
in vec3 vNormal;
in vec2 vTexCoords;
in vec4 vColor;

out vec4 fragColor;

void main(void) {
   vec3 normal = vNormal;

   if (!triangles.smoothShading) {
      normal = normalize(cross(dFdx(vPosition.xyz), dFdy(vPosition.xyz)));
   }

   vec4 color = vColor;
   
   // Use two sided phong lighting. This has no effect if "material" property is not set.
   vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, vPosition.xyz, normal);

   fragColor = vec4(lightColor, vColor.a);
   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
