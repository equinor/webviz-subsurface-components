const vsShader = `\
#version 300 es
#define SHADER_NAME grid3d-cell-vertex-shader

in vec3 positions;
in vec3 normals;
in float properties;

// Outputs to fragment shader
out vec3 cameraPosition;
out vec4 position_commonspace;

flat out vec3 normal;
flat out int vertexIndex;
flat out float property;

uniform bool ZIncreasingDownwards;

const vec3 pickingColor = vec3(1.0, 1.0, 0.0);

void main(void) { 
   
   vertexIndex = gl_VertexID;
   cameraPosition = project_uCameraPosition;   
   geometry.pickingColor = pickingColor;

   normal = normals;
   vec3 position = positions;

   float zSign = ZIncreasingDownwards ? -1.0 : 1.0;

   position.z *= zSign;
   normal.z   *= zSign;

   property = properties;

   position_commonspace = vec4(project_position(position), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);

   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   vec4 color = vec4(0.0);
   DECKGL_FILTER_COLOR(color, geometry);
}
`;

export default vsShader;