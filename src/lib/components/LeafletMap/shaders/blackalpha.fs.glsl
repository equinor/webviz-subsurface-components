// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// Copyright (C) 2020 - Equinor ASA.

precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution;


void main() {
    vec4 colors = texture2D(u_image, gl_FragCoord.xy/u_resolution);

    if(colors.r == 0.0 && colors.g == 0.0 && colors.b == 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    } else {
        gl_FragColor = colors;
    }
}