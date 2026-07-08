// luma.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Webviz note: Copied this module from luma.gl.
// https://github.com/visgl/luma.gl branch 9.3-release
// Modified imports and commented PHONG_WGSL in file "phong-material.ts".
// Modified function "lighting_getLightColor" in file "phong-shaders-glsl.ts" to get two sided phong lighting.

export const PHONG_VS = /* glsl */ `\
layout(std140) uniform phongMaterialUniforms {
  uniform bool unlit;
  uniform float ambient;
  uniform float diffuse;
  uniform float shininess;
  uniform vec3  specularColor;
} material;
`;

export const PHONG_FS = /* glsl */ `\
layout(std140) uniform phongMaterialUniforms {
  uniform bool unlit;
  uniform float ambient;
  uniform float diffuse;
  uniform float shininess;
  uniform vec3  specularColor;
} material;

// Note modified for two sided lighting.
vec3 lighting_getLightColor(vec3 surfaceColor, vec3 light_direction, vec3 view_direction, vec3 normal_worldspace, vec3 color) {
  vec3 halfway_direction = normalize(light_direction + view_direction);

  // initial code
  // float lambertian = dot(light_direction, normal_worldspace);
  // float specular = 0.0;
  // if (lambertian > 0.0) {
  //   float specular_angle = max(dot(normal_worldspace, halfway_direction), 0.0);
  //   specular = pow(specular_angle, material.shininess);
  // }
  // lambertian = max(lambertian, 0.0);
  
  // new code for two sided lighting
  float lambertian = abs(dot(light_direction, normal_worldspace));
  float specular_angle = abs(dot(normal_worldspace, halfway_direction));
  float specular = pow(specular_angle, material.shininess);

  return (lambertian * material.diffuse * surfaceColor + specular * floatColors_normalize(material.specularColor)) * color;
}

vec3 lighting_getLightColor(vec3 surfaceColor, vec3 cameraPosition, vec3 position_worldspace, vec3 normal_worldspace) {
  vec3 lightColor = surfaceColor;

  if (material.unlit) {
    return surfaceColor;
  }

  if (lighting.enabled == 0) {
    return lightColor;
  }

  vec3 view_direction = normalize(cameraPosition - position_worldspace);
  lightColor = material.ambient * surfaceColor * lighting.ambientColor;

  for (int i = 0; i < lighting.pointLightCount; i++) {
    PointLight pointLight = lighting_getPointLight(i);
    vec3 light_position_worldspace = pointLight.position;
    vec3 light_direction = normalize(light_position_worldspace - position_worldspace);
    float light_attenuation = getPointLightAttenuation(pointLight, distance(light_position_worldspace, position_worldspace));
    lightColor += lighting_getLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, pointLight.color / light_attenuation);
  }

  for (int i = 0; i < lighting.spotLightCount; i++) {
    SpotLight spotLight = lighting_getSpotLight(i);
    vec3 light_position_worldspace = spotLight.position;
    vec3 light_direction = normalize(light_position_worldspace - position_worldspace);
    float light_attenuation = getSpotLightAttenuation(spotLight, position_worldspace);
    lightColor += lighting_getLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, spotLight.color / light_attenuation);
  }

  for (int i = 0; i < lighting.directionalLightCount; i++) {
    DirectionalLight directionalLight = lighting_getDirectionalLight(i);
    lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);
  }
  
  return lightColor;
}
`;
