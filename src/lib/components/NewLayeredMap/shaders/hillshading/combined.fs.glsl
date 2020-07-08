precision highp float;

uniform sampler2D tSoftShadow;
uniform sampler2D tAmbient;
uniform sampler2D u_colormap;
uniform vec2 resolution;

void main() {

    vec2 ires = 1.0 / resolution;
    vec3 colormap = texture2D(u_colormap, ires * gl_FragCoord.xy).rgb;
    float softShadow = texture2D(tSoftShadow, ires * gl_FragCoord.xy).r;
    float ambient = texture2D(tAmbient, ires * gl_FragCoord.xy).r;
    // float l = 4.0 * softShadow + 0.25 * ambient;
    float l = 1.0 * softShadow + 0.25 * ambient;
    gl_FragColor = vec4(l,l,l, 1.0);

    // Add colormap
    gl_FragColor = texture2D(u_colormap, vec2(l, 0.0));
}