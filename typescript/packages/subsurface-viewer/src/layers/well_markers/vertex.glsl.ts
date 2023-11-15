const vsShader = `\
#version 300 es
#define SHADER_NAME well-markers-vertex-shader
precision highp float;

attribute vec3 positions;
attribute vec3 instancePositions;
attribute float instanceInclinations;

out vec4 position_commonspace;

void main(void) { 
   
   float sinA = sin (180.0 / PI * instanceInclinations);
   float cosA = 1.0 - sinA * sinA;

   mat3 inclMatrix = mat3(vec3(1.0, 0.0, 0.0), vec3(0.0, cosA, sinA), vec3(0.0, -sinA, cosA));
   vec3 rotatedPos = inclMatrix * positions;

   position_commonspace = vec4(project_position(rotatedPos + instancePositions), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);
}
`;

export default vsShader;
