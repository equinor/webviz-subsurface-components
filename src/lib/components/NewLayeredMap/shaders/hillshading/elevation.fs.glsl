precision highp float;

uniform sampler2D tElevation;
uniform vec2 resolution;
uniform float elevationScale;

void main() {
    // Sample the terrain-rgb tile at the current fragment location.
    vec3 rgb = texture2D(tElevation, gl_FragCoord.xy/resolution).rgb;

    // Convert the red, green, and blue channels into an elevation.
    float e = -10000.0 + ((rgb.r * 255.0 * 256.0 * 256.0 + rgb.g * 255.0 * 256.0 + rgb.b * 255.0) * 0.1);

    // Scale the elevation and write it out.
    gl_FragColor = vec4(vec3(e * elevationScale), 1.0);
    // gl_FragColor = 10000.0*vec4(e, e, e, 1.0);
}