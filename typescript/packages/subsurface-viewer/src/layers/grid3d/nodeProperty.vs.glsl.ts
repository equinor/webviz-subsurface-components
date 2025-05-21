export default `\
#version 300 es
#define SHADER_NAME grid3d-node-vertex-shader

in vec3 positions;
in vec3 normals;

// Outputs to fragment shader
out vec3 cameraPosition;
out vec4 position_commonspace;
out float property;

flat out vec3 normal;
flat out int vertexIndex;

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

   switch(int(grid.coloringMode)) {
      case 2:
         property = position.x;
         break;
      case 3:
         property = position.y;
         break;
      case 4:
         property = position.z;
         break;
      // case 0 or default should never be used
      default:
         property = position.z;
         break;
   }

   position_commonspace = vec4(project_position(position), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);

   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   vec4 color = vec4(0.0);
   DECKGL_FILTER_COLOR(color, geometry);
}
`;
