// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// Copyright (C) 2020 - Equinor ASA.

precision mediump float;

uniform sampler2D u_image;
uniform sampler2D u_colormap_frame;
uniform float u_colormap_length;

varying vec2 v_texCoord;

void main() {
    float map_array = texture2D(u_image, v_texCoord).r;
    gl_FragColor = texture2D(u_colormap_frame, vec2((map_array * (u_colormap_length - 1.0) + 0.5) / u_colormap_length, 0.5));
}
