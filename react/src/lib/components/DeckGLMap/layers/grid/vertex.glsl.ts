const gridVertex = `#version 300 es
#define SHADER_NAME graph-layer-axis-vertex-shader

precision highp float;

in vec3 positions;

in vec3 color; // XXX in her i stedet?

// in int cell_index;  // uint kanskje?
// out int cell_index2;

out vec3 vColor;

void main(void) {
   vColor = color;

   vec3 position_commonspace = project_position(positions);
   gl_Position = project_common_position_to_clipspace(vec4(position_commonspace, 0.0));
}
`;

export default gridVertex;
