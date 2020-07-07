precision mediump float;

uniform sampler2D u_image;
uniform sampler2D u_colormap_frame;
uniform float u_colormap_length;
uniform bool u_log_scale; // varying?

varying vec2 v_texCoord;

// Global min max: https://www.gamedev.net/forums/topic/559942-glsl--find-global-min-and-max-in-texture/

// Maps a value from a given interval to a target interval
//takes in a 0.0-1.0, maps it to 0-255
float map(float value, float from1, float to1, float from2, float to2) {
    // return (1.0 * to2); //value * 255, value ranges from 1  to 0 
    return ((value - from1)/(to1 - from1))*(to2 - from2) + from2; // (red - 0 / (1-0)) * (255 - 0)
}


// See: https://stackoverflow.com/questions/28125439/algorithm-to-map-values-to-unit-scale-with-logarithmic-spacing
float map_log(float value, float from1, float to1, float from2, float to2) {
    float linear_value = ((value - from1)/(to1 - from1))*(to2 - from2) + from2 +1.0; // +1.0 fixes f(0) = -n 
    float logarithmic_value = ((to2 - from2) * log(linear_value))/log((to2 - from2));
    return logarithmic_value;
}


void main() {
    float color_value = texture2D(u_image, v_texCoord).r;
    float mapped_color_value = 10.0; 
    if (u_log_scale){
        mapped_color_value = map_log(color_value, 0.0, 1.0, 0.0, u_colormap_length - 1.0); // from 0 to 1 and from 0 to 255
    } else {
        mapped_color_value = map(color_value, 0.0, 1.0, 0.0, u_colormap_length - 1.0); // from 0 to 1 and from 0 to 255
    }
    vec2 colormap_coord = vec2((mapped_color_value) / u_colormap_length, 0.0);
    gl_FragColor = texture2D(u_colormap_frame, colormap_coord);
}
