export default `#version 300 es
#define SHADER_NAME well-markers-fragment-shader

in vec4 vColor;

out vec4 fragColor;

void main(void) {
   fragColor = vec4(vColor.rgb * (1.0 / 255.0), vColor.a * (1.0 / 255.0));
   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
