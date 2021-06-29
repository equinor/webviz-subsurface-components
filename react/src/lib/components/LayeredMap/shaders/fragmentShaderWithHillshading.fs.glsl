// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// Copyright (C) 2020 - Equinor ASA.

precision mediump float;

uniform sampler2D u_image;
uniform sampler2D u_colormap_frame;
uniform vec2 u_resolution_fragment;
uniform float u_colormap_length;
uniform float u_elevation_scale;
uniform vec3 u_light_direction;

varying vec2 v_texCoord;

void main() {
    vec2 pixelPos = vec2(gl_FragCoord.x, u_resolution_fragment.y - gl_FragCoord.y);

    float v0 = texture2D(u_image, pixelPos / u_resolution_fragment).r;
    float vx = texture2D(u_image, (pixelPos + vec2(1.0, 0.0)) / u_resolution_fragment).r;
    float vy = texture2D(u_image, (pixelPos + vec2(0.0, 1.0)) / u_resolution_fragment).r;

    // Create tangent vector components along terrain
    // in x and y directions respectively:
    vec3 dx = vec3(u_elevation_scale, 0.0, vx - v0);
    vec3 dy = vec3(0.0, u_elevation_scale, v0 - vy);

    // Calculate terrain normal vector by taking cross product of dx and dy.
    // Then calculate simple hill shading by taking dot product between
    // normal vector and light direction vector.
    float light = 0.5 * dot(normalize(cross(dx, dy)), u_light_direction) + 0.5;

    float map_array = texture2D(u_image, v_texCoord).r;
    vec4 color = texture2D(u_colormap_frame, vec2((map_array * (u_colormap_length - 1.0) + 0.5) / u_colormap_length, 0.5));

    gl_FragColor = color * vec4(light, light, light, 1.0);
}
