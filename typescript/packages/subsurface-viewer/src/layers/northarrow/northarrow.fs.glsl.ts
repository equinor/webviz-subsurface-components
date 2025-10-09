export default `\
#version 300 es
#define SHADER_NAME northarrow-fragment-shader

out vec4 fragColor;

void main(void) {
  fragColor = vec4(northArrow3D.uColor.rgb, northArrow3D.uColor.a * layer.opacity);
}
`;
