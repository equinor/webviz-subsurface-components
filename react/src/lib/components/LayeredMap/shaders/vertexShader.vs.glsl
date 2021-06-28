// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// Copyright (C) 2020 - Equinor ASA.

attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution_vertex;
    
varying vec2 v_texCoord;

void main() {
    // Convert from pixel range ([0, w] x [0, h]) to clip space ([-1, 1] x [-1, 1]):
    vec2 clipSpace = (a_position / u_resolution_vertex) * 2.0 - 1.0;

    // Flip y axis
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

    // Pass the texCoord to the fragment shader
    v_texCoord = a_texCoord;
}
