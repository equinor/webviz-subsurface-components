export default `\
#version 300 es
#define SHADER_NAME grid3d-cell-vertex-shader

in vec3 positions;
in vec3 normals;
in float properties;

// Outputs to fragment shader
out vec3 cameraPosition;
out vec4 position_commonspace;
out vec4 vColor;

flat out vec3 normal;
flat out int vertexIndex;
flat out float property;

const vec3 pickingColor = vec3(1.0, 1.0, 0.0);

void main(void) { 
   
   vertexIndex = gl_VertexID;
   cameraPosition = project.cameraPosition;   
   geometry.pickingColor = pickingColor;

   normal = normals;
   vec3 position = positions;

   float zSign = grid.ZIncreasingDownwards ? -1.0 : 1.0;

   position.z *= zSign;
   normal.z   *= zSign;

   property = properties;

   position_commonspace = vec4(project_position(position), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);

   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   vColor = vec4(0.0, 0.0, 0.0, layer.opacity);
   DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
