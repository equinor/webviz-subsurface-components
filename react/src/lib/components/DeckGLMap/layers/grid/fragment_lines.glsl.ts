const fragmentShader = `#version 300 es
#define SHADER_NAME graph-layer-fragment-shader

precision highp float;

in vec3 vColor;

out vec4 fragColor;

void main(void) {
 
  if (picking_uActive) {
    fragColor = vec4(1.0, 0.0, 0.0,   1.0);
    return;
  }

  fragColor = vec4(vColor, 1.0);
}
`;

export default fragmentShader;
