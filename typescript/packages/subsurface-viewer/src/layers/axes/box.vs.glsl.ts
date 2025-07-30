export default `#version 300 es
#define SHADER_NAME axes-grid-vertex-shader

in  vec3 positions;
out vec4 vColor;
uniform vec4 uColor;

void main(void) {
   vec3 position_commonspace = project_position(positions);
   gl_Position = project_common_position_to_clipspace(vec4(position_commonspace, 0.0));
   vColor = vec4(uColor.rgb, uColor.a * layer.opacity);
   DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
