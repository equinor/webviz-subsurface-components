const gridVertex = `#version 300 es
#define SHADER_NAME graph-layer-axis-vertex-shader

precision highp float;

in vec3 positions;
in vec3 color;
in int cell_index;
flat out int cell_index_fs;

out vec3 vColor;
out vec3 position_commonspace;
out vec3 cameraPosition;

void main(void) {
   cameraPosition = project_uCameraPosition;
   
   vColor = color;

   position_commonspace = project_position(positions);
   gl_Position = project_common_position_to_clipspace(vec4(position_commonspace, 0.0));

   cell_index_fs = cell_index;
}
`;

export default gridVertex;
