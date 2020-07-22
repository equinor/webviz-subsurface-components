precision highp float;
    
uniform sampler2D tElevation;
uniform vec2 resolution;
uniform float pixelScale;

void main() {
    vec2 dr = 1.0/resolution;
    vec4 colors = texture2D(tElevation, dr * (gl_FragCoord.xy + vec2(0.0, 0.0))).rgba;

    float p0 = colors.r;
    float px = texture2D(tElevation, dr * (gl_FragCoord.xy + vec2(1.0, 0.0))).r;
    float py = texture2D(tElevation, dr * (gl_FragCoord.xy + vec2(0.0, 1.0))).r;
    vec3 dx = vec3(pixelScale, 0.0, px - p0);
    vec3 dy = vec3(0.0, pixelScale, py - p0);
    vec3 n = normalize(cross(dx, dy));
    // gl_FragColor = vec4(0.5 * n + 0.5, 1.0);
    gl_FragColor = vec4(n, colors.a);
}