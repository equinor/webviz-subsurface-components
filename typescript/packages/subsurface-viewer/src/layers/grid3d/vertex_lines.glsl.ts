export default `\
#version 300 es
#define SHADER_NAME vertex-lines-shader

precision highp float;

in vec3 positions;

out vec4 position_commonspace;

uniform bool ZIncreasingDownwards;

void main(void) {
   vec3 position = positions;
   position[2] *= ZIncreasingDownwards ? -1.0 : 1.0;

   vec3 position_commonspace = project_position(position);
   gl_Position = project_common_position_to_clipspace(vec4(position_commonspace, 0.0));
}
`;
