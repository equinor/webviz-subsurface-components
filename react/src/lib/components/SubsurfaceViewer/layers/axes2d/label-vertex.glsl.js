export default `\
#version 300 es
#define SHADER_NAME graph-layer-axis-vertex-shader

precision highp float;

in  vec3 positions;

in vec2 vTexCoord;
out vec2 _vTexCoord;

uniform mat4 projectionMatrix;

void main(void) {
   _vTexCoord = vTexCoord;

   vec3 position_commonspace = positions; // These positions are in view space.
   gl_Position = projectionMatrix * vec4(position_commonspace, 1.0); // From viewspace to clip
}
`;
