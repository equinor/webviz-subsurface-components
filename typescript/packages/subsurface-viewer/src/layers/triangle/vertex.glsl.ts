const vsShader = `\
#version 300 es
#define SHADER_NAME vertex-shader

precision highp float;

// Primitive attributes
in vec3 positions;
in float properties;
in vec3 normals;

// Outputs to fragment shader
out vec3 cameraPosition;
out vec3 normals_commonspace;
out vec4 position_commonspace;
out vec3 worldPos;
out float property;

uniform bool ZIncreasingDownwards;

const vec3 pickingColor = vec3(1.0, 1.0, 0.0);

void main(void) {
   geometry.pickingColor = pickingColor;

   cameraPosition = project_uCameraPosition;

   vec3 position = positions;
   position[2] *= ZIncreasingDownwards ? -1.0 : 1.0;

   worldPos = position;

   normals_commonspace = normals;

   property = properties;

   position_commonspace = vec4(project_position(position), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);

   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   vec4 color = vec4(0.0);
   DECKGL_FILTER_COLOR(color, geometry);
}
`;

export default vsShader;
