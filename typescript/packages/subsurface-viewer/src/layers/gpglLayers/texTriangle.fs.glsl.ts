export default `#version 300 es
#define SHADER_NAME texture-fragment-shader

precision highp float;

uniform sampler2D valueTexture;
uniform sampler2D colormap;

in vec3 cameraPosition;

in vec4 vPosition;
in vec3 vNormal;
in vec2 vTexCoords;
in vec4 vColor;

out vec4 fragColor;

   // Normalize the value to the range [0, 1]
float normalizeValue(float value) {
   return (value - triangles.colormapRange[0]) / (triangles.colormapRange[1] - triangles.colormapRange[0]);
}

vec4 valueColor(float value) {
   if(value == triangles.undefinedValue) {
      return triangles.undefinedColor;
   }
   if(triangles.useClampColors) {
      if(value < triangles.clampRange[0]) {
         return triangles.lowClampColor;
      } else if(value > triangles.clampRange[1]) {
         return triangles.highClampColor;
      }
   }
   float normalizedValue = normalizeValue(value);
   // apply colormap
   return texture(colormap, vec2(normalizedValue, 0.0));
}

void main(void) {
   vec3 normal = vNormal;

   if (!triangles.smoothShading) {
      normal = normalize(cross(dFdx(vPosition.xyz), dFdy(vPosition.xyz)));
   }

   vec4 color = vColor;
   
   // Use two sided phong lighting. This has no effect if "material" property is not set.
   vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, vPosition.xyz, normal);

   // get value from texture
   float value = texture(valueTexture, vTexCoords).r;
   // compute color
   vec4 colormapColor = valueColor(value);

   // multiply by colormap color and apply alpha
   fragColor = vec4(lightColor * colormapColor.rgb, colormapColor.a * vColor.a);
   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
