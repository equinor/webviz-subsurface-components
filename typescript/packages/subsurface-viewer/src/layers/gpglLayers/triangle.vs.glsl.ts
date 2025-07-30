export default `\
#version 300 es
#define SHADER_NAME texture-vertex-shader

// Primitive attributes
in vec3 positions;
in vec3 normals;
in vec2 texCoords;

// Outputs to fragment shader
out vec3 cameraPosition;

out vec4 vPosition;
out vec3 vNormal;
out vec2 vTexCoords;
out vec4 vColor;
 
const vec3 pickingColor = vec3(1.0, 1.0, 0.0);

void main(void) {
   geometry.pickingColor = pickingColor;

   cameraPosition = project.cameraPosition;

   // apply Z increasing downwards transformation if needed
   vec3 position = positions;
   position[2] *= triangles.ZIncreasingDownwards ? -1.0 : 1.0;
   vec3 normal = normals;
   normal[2] *= triangles.ZIncreasingDownwards ? -1.0 : 1.0;

   vTexCoords = texCoords;
   
   // convert from projection system to cartesian common space
   vPosition = vec4(project_position(position), 0.0);
   // should the normal be projected: project_normal(normal) ?
   vNormal = normal;
   gl_Position = project_common_position_to_clipspace(vPosition);

   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   vColor = vec4(triangles.uColor.rgb, triangles.uColor.a * layer.opacity);
   DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
