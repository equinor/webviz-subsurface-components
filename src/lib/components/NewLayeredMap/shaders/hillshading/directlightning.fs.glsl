precision highp float;

uniform sampler2D tNormal;
uniform vec2 resolution;
uniform vec3 sunDirection;

void main() {
    vec2 dr = 1.0/resolution;
    vec3 n = texture2D(tNormal, gl_FragCoord.xy/resolution).rgb;
    float l = dot(n, sunDirection);
    l = 0.5 * l + 0.5;
    gl_FragColor = vec4(l, l, l, 1.0);
    //gl_FragColor = texture2D(tNormal, gl_FragCoord.xy / resolution);
}