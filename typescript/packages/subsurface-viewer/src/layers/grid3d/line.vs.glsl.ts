export default `\
#version 300 es
#define SHADER_NAME grid3d-lines-vertex-shader

in vec3 positions;

out vec4 position_commonspace;
out vec4 vColor;

void main(void) {
   vec3 position = positions;
   position[2] *= grid.ZIncreasingDownwards ? -1.0 : 1.0;

   vec3 position_commonspace = project_position(position);
   gl_Position = project_common_position_to_clipspace(vec4(position_commonspace, 0.0));

   vColor = vec4(0.0, 0.0, 0.0, layer.opacity);
   DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
