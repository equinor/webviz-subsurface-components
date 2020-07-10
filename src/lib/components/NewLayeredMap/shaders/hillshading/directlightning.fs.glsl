precision highp float;

uniform sampler2D tNormal;
uniform vec2 resolution;
uniform vec3 sunDirection;

void main() {
    vec2 dr = 1.0/resolution;
    vec3 n = texture2D(tNormal, gl_FragCoord.xy/resolution).rgb;
    float light = dot(n, sunDirection);
    //light = 1.0 * light + 5.0;
    gl_FragColor = vec4(light, light, light, 1.0);
}

