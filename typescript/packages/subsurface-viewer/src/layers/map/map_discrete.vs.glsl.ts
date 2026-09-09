export default `\
#version 300 es
#define SHADER_NAME map-discrete-vertex-shader

in vec3 positions;

in vec3 colors;
in vec3 pickingColors;

in vec3 vertexColor;
flat out vec3 vertexColor_;

// Outputs to fragment shader
out vec2 vTexCoord;
out vec3 cameraPosition;
out vec4 position_commonspace;
out vec4 vColor;
out vec3 worldPos;

in uint properties;
flat out uint property;

flat out lowp int vertexIndex;

void main(void) {
   property = properties;

  vertexColor_ = vertexColor;

   geometry.pickingColor = pickingColors;
   vertexIndex = gl_VertexID;

   vec3 position = positions;
   position[2] *= map_d.ZIncreasingDownwards ? -1.0 : 1.0;

   cameraPosition = project.cameraPosition;

   worldPos = position;
   geometry.worldPosition = position;

   position_commonspace = vec4(project_position(position), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);

   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   vColor = vec4(colors.rgb, layer.opacity);
   DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
