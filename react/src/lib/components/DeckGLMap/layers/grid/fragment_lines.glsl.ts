const fragmentShader = `#version 300 es
#define SHADER_NAME graph-layer-fragment-shader

precision highp float;

in vec3 vColor;

out vec4 fragColor;

void main(void) {

  fragColor = vec4(vColor, 1.0);    // vec4(0.0, 1.0, 0.0, 1.0);  
}
`;

export default fragmentShader;
