const fs = `
// Note: modification of luma.gl's functions to get two sided phong lighting.
// Ref original file modules/shadertools/src/modules/phong-lighting/phong-lighting.glsl.ts in luma source.

vec3 getPhongLightColor(vec3 surfaceColor, vec3 light_direction, vec3 view_direction, vec3 normal_worldspace, vec3 color) {
    
  vec3 halfway_direction = normalize(light_direction + view_direction);   
  float lambertian = abs(dot(light_direction, normal_worldspace));

  float specular_angle = abs(dot(normal_worldspace, halfway_direction));

  float specular = pow(specular_angle, lighting_uShininess);       
  return (lambertian * lighting_uDiffuse * surfaceColor + specular * lighting_uSpecularColor) * color;    
}

vec3 getPhongLightColor(vec3 surfaceColor,vec3 cameraPosition, vec3 position_worldspace, vec3 normal_worldspace) {

 vec3 lightColor = surfaceColor;

 if (lighting_uEnabled) {
   vec3 view_direction = normalize(cameraPosition - position_worldspace);
   lightColor = lighting_uAmbient * surfaceColor * lighting_uAmbientLight.color;

   for (int i = 0; i < MAX_LIGHTS; i++) {
     if (i >= lighting_uPointLightCount) {
       break;
     }
     PointLight pointLight = lighting_uPointLight[i];
     vec3 light_position_worldspace = pointLight.position;
     vec3 light_direction = normalize(light_position_worldspace - position_worldspace);
     lightColor += getPhongLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, pointLight.color);
   }

   for (int i = 0; i < MAX_LIGHTS; i++) {
     if (i >= lighting_uDirectionalLightCount) {
       break;
     }
     DirectionalLight directionalLight = lighting_uDirectionalLight[i];
     lightColor += getPhongLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);
   }
 }
 return lightColor;
}
`;

export default fs;
