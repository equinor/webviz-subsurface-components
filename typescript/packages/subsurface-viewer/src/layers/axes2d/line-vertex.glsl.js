export default `\
#version 300 es
#define SHADER_NAME axes2dlayer-line-vertex-shader

precision highp float;

uniform float uClipZ;

in vec3 positions;

void main(void) {
   vec3 position_commonspace = project_position(positions);
   vec4 position_clipspace = project_common_position_to_clipspace(vec4(position_commonspace, 1.0));
   gl_Position = vec4(position_clipspace.x, position_clipspace.y, uClipZ, position_clipspace.w);
}
`;
