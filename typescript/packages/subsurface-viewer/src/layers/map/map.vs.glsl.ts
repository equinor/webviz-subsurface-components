export default `\
#version 300 es
#define SHADER_NAME map-vertex-shader

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

void main(void) {
   geometry.pickingColor = vec3(1.0, 1.0, 0.0);
   vertexIndex = gl_VertexID;

   vec3 position = positions;
   position[2] *= map.ZIncreasingDownwards ? -1.0 : 1.0;

   cameraPosition = project.cameraPosition;

   worldPos = position;
   geometry.worldPosition = position;

   normals_commonspace = normals;

   property = properties;

   position_commonspace = vec4(project_position(position), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);

   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   vColor = vec4(colors.rgb, layer.opacity);
   DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
