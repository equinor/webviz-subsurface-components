export default `\
#version 300 es
#define SHADER_NAME triangle-vertex-shader

// Primitive attributes
in vec3 positions;
in float properties;
in vec3 normals;

// Outputs to fragment shader
out vec3 cameraPosition;
out vec3 normals_commonspace;
out vec4 position_commonspace;
out vec4 vColor;
out vec3 worldPos;

const vec3 pickingColor = vec3(1.0, 1.0, 0.0);

void main(void) {
   geometry.pickingColor = pickingColor;

   cameraPosition = project.cameraPosition;

   vec3 position = positions;
   position[2] *= triangles.ZIncreasingDownwards ? -1.0 : 1.0;

   worldPos = position;

   normals_commonspace = normals;

   position_commonspace = vec4(project_position(position), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);

   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   vColor = vec4(triangles.uColor.rgb, triangles.uColor.a * layer.opacity);
   DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
