const vsShader = `\
#version 300 es
#define SHADER_NAME vertex-shader

precision highp float;

// Primitive attributes
in vec3 positions;
in float properties;
in vec3 normals;
in vec3 colors;

// Outputs to fragment shader
out vec2 vTexCoord;
out vec3 cameraPosition;
out vec3 normals_commonspace;
out vec4 position_commonspace;
out vec4 vColor;
out vec3 worldPos;
out float property;
flat out int vertexIndex;

uniform bool ZIncreasingDownwards;

void main(void) {
   geometry.pickingColor = vec3(1.0, 1.0, 0.0);
   vertexIndex = gl_VertexID;

   vec3 position = positions;
   position[2] *= ZIncreasingDownwards ? -1.0 : 1.0;

   cameraPosition = project_uCameraPosition;

   worldPos = position;
   geometry.worldPosition = position;

   normals_commonspace = normals;

   vColor = vec4(colors.rgb, 1.0);

   property = properties;

   position_commonspace = vec4(project_position(position), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);

   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   vec4 color = vec4(0.0);
   DECKGL_FILTER_COLOR(color, geometry);
}
`;

export default vsShader;
