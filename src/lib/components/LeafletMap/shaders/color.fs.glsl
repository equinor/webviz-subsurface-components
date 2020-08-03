precision highp float;

uniform sampler2D u_image;
uniform sampler2D u_raw_image;
uniform vec2 u_resolution;

// Colorscale configurations
uniform sampler2D u_colormap;
uniform float u_colormap_length;
uniform float u_max_color_value;
uniform float u_min_color_value;
uniform float u_scale_type;
uniform bool u_black_to_alpha;

// Maps a value from a given interval to a target interval
// For example can take in a 0.0-1.0, and map it to 0-255
float map(float value, float from1, float to1, float from2, float to2) {
    float linear_value = ((value - from1)/(to1 - from1))*(to2 - from2) + from2;
    return linear_value;
}


// See: https://stackoverflow.com/questions/28125439/algorithm-to-map-values-to-unit-scale-with-logarithmic-spacing
float map_log(float value, float from1, float to1, float from2, float to2) {
    float linear_value = map(value, from1, to1, from2, to2) + 1.0; // + 1.0 is to avoid negative log-values
    float logarithmic_value = ((to2 - from2) * log(linear_value))/log((to2 - from2));
    return logarithmic_value;
}

// Calculate color value
vec4 calcColorValue(vec4 colors, vec4 raw_colors, float scale_type) {
    float color_value = colors.r;
    if(color_value < 0.0) {
        color_value = 0.0;
    }
    float raw_value = raw_colors.r;

    float mapped_color_value = 0.0; 
    if (scale_type == 1.0) {
        mapped_color_value = map_log(color_value, 0.0, 1.0, 0.0, u_colormap_length - 1.0); // from 0 to 1 and from 0 to 255
    } else {
        mapped_color_value = map(color_value, 0.0, 1.0, 0.0, u_colormap_length - 1.0); // from 0 to 1 and from 0 to 255
    }

    if (u_black_to_alpha == true && raw_colors.r == 0.0 && raw_colors.g == 0.0 && raw_colors.b == 0.0) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    }

    if (raw_value > u_max_color_value/255.0 || raw_value < u_min_color_value/255.0 || colors.a == 0.0) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    }

    vec2 colormap_coord = vec2((mapped_color_value) / u_colormap_length, 0.0);
    return texture2D(u_colormap, colormap_coord);
}

void main() {
    vec4 colors = texture2D(u_image, gl_FragCoord.xy/u_resolution).rgba;
    vec4 raw_colors = texture2D(u_raw_image, gl_FragCoord.xy/u_resolution).rgba;

    gl_FragColor = calcColorValue(colors, raw_colors, u_scale_type);
}