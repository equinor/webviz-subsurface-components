const fsShader = `#version 300 es
#define SHADER_NAME well-markers-fragment-shader

precision highp float;

in vec3 color;

void main(void) {
   gl_FragColor = vec4(color.rgb * (1.0/ 256.0), 1.0);
   //DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;

export default fsShader;
