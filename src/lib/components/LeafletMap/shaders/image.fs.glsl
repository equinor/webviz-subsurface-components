// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// Copyright (C) 2020 - Equinor ASA.

precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_max_color_value;
uniform float u_min_color_value;


void main() {
    vec4 colors = texture2D(u_image, gl_FragCoord.xy/u_resolution);

    if (colors.r > u_max_color_value/255.0 || colors.r < u_min_color_value/255.0) {
        colors = vec4(0.0, 0.0, 0.0, 0.0);
    }

    gl_FragColor = colors;
}