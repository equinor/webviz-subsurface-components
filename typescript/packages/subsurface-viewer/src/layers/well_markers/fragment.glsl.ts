export const fsShader = `#version 300 es
#define SHADER_NAME well-markers-fragment-shader

precision highp float;

in vec4 color;

void main(void) {

   gl_FragColor = vec4(color.rgba * (1.0 / 255.0));
   DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
