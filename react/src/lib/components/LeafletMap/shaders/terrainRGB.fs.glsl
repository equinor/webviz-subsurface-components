// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// Copyright (C) 2020 - Equinor ASA.

precision highp float;

const int INTERP_LINEAR = 0;
const int INTERP_LOG    = 1;

uniform sampler2D u_data_texture;
uniform vec2 u_resolution;

uniform sampler2D u_colormap;
uniform int u_interpolation_type;
uniform float u_value_range;
uniform vec2 u_remap_colormap;
uniform vec2 u_clamp_colormap;

uniform bool u_apply_color_scale;
uniform bool u_apply_hillshading;

uniform vec3 u_sun_direction;
uniform float u_ambient_light_intensity;
uniform float u_diffuse_light_intensity;

uniform float u_elevation_scale;

// TODO: Investigate using R32 textures (webgl2) to avoid this transformation.
float elevation_from_rgb(vec3 col) {
    // Decode elevation data. Format is similar to the Mapbox Terrain RGB:
    // https://docs.mapbox.com/help/troubleshooting/access-elevation-data/
    // but without the -10000 offset and the 0.1 scale.
    // The elevations are also scaled to cover the whole RGB domain, for better precision,
    // so we need to scale them down to the original domain.
    float elevation = col.r * 255.0 * 256.0 * 256.0 + col.g * 255.0 * 256.0 + col.b * 255.0 ;
    float scale_factor = u_value_range / (256.0*256.0*256.0 - 1.0);
    return elevation * scale_factor *  u_elevation_scale;
}

vec4 color_map(float elevation) {
    float colormap_u = 0.0;
    if (u_interpolation_type == INTERP_LOG) {
        // Add one to avoid log(0). The result should be the same.
        colormap_u = log(elevation + 1.0) / log(u_value_range + 1.0);
    }
    else { // u_interpolation_type == INTERP_LINEAR
        colormap_u = elevation / u_value_range;
    }

    // Cutoff
    if (colormap_u < u_clamp_colormap.x || colormap_u > u_clamp_colormap.y) {
        discard;
    }

    // Remap
    colormap_u = mix(u_remap_colormap.x, u_remap_colormap.y, colormap_u);

    return texture2D(u_colormap, vec2(colormap_u, 0.0));
}

vec3 normal(float elevation) {
    vec2 dr = 1.0/u_resolution;
    float p0 = elevation;
    float px = elevation_from_rgb(texture2D(u_data_texture, dr * (gl_FragCoord.xy + vec2(1.0, 0.0))).rgb);
    float py = elevation_from_rgb(texture2D(u_data_texture, dr * (gl_FragCoord.xy + vec2(0.0, 1.0))).rgb);
    vec3 dx = vec3(1.0, 0.0, px - p0);
    vec3 dy = vec3(0.0, 1.0, py - p0);

    return normalize(cross(dx, dy));
}

float light(vec3 normal) {
    float diffuse = u_diffuse_light_intensity * dot(normal, u_sun_direction);

    return clamp(u_ambient_light_intensity + diffuse, 0.0, 1.0);
}

void main() {
    vec4 final_color = texture2D(u_data_texture, gl_FragCoord.xy/u_resolution);

    if (final_color.a == 0.0) {
        discard;
    }

    float elevation = elevation_from_rgb(final_color.rgb);

    if (u_apply_color_scale) {
        // The colorscale shouldn't be affected by the elevation scale.
        final_color = color_map(elevation / u_elevation_scale);
    }

    if (u_apply_hillshading) {
        vec3 normal = normal(elevation);
        final_color.rgb = final_color.rgb * light(normal);
    }

    gl_FragColor = final_color;
}