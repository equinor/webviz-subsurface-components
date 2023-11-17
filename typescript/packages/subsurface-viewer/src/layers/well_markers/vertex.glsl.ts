export const vsShader = `#version 300 es
#define SHADER_NAME well-markers-vertex-shader
precision highp float;

attribute vec3 positions;
attribute vec3 instancePositions;
attribute float instanceAzimuths;
attribute float instanceInclinations;
attribute vec3 instanceColors;
attribute vec3 instancePickingColors;


out vec4 position_commonspace;
out vec4 color;

void main(void) {   
   geometry.worldPosition = instancePositions;
   geometry.pickingColor  = instancePickingColors;

   color = vec4(instanceColors.rgb, 100);

   float sinA = sin (PI / 180.0 * instanceAzimuths);
   float cosA = cos (PI / 180.0 * instanceAzimuths);

   float sinI = sin (PI / 180.0 * instanceInclinations);
   float cosI = cos (PI / 180.0 * instanceInclinations);

   mat3 azimuthMatrix = mat3(vec3(cosA, sinA, 0.0), vec3(-sinA, cosA, 0.0), vec3(0.0, 0.0, 1.0));
   mat3 inclMatrix    = mat3(vec3(1.0, 0.0, 0.0), vec3(0.0, cosI, sinI), vec3(0.0, -sinI, cosI));
   vec3 rotatedPos    = azimuthMatrix * inclMatrix * positions;

   position_commonspace = vec4(project_position(rotatedPos + instancePositions), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);

   vec4 dummyColor = vec4(0.0);

   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
   DECKGL_FILTER_COLOR(dummyColor, geometry);
}
`;
