precision mediump float;

uniform sampler2D u_image;
uniform sampler2D u_colormap_frame;
uniform float u_colormap_length;

varying vec2 v_texCoord;

void main() {
    float map_array = texture2D(u_image, v_texCoord).r;
    gl_FragColor = texture2D(u_colormap_frame, vec2((map_array * (u_colormap_length - 1.0) + 0.5) / u_colormap_length, 0.5));
}
