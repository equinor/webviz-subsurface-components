/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import { drawWithTerrainRGB } from "./commands";

// Utils
import Utils from "../utils";

export default async (gl, canvas, image, colormap = null, config = {}) => {
    gl.getExtension("OES_texture_float");

    const imagesToLoad = [Utils.loadImage(image, config)];
    if (colormap) {
        imagesToLoad.push(Utils.loadImage(colormap, config));
    }

    let [loadedImage, loadedColorMap = null] = await Promise.all(
        imagesToLoad
    ).catch(console.error);

    // Select which draw command to draw
    const shader = config.shader || {};
    const colorScale = config.colorScale || {};
    if (!shader.type || shader.type == "terrainRGB") {
        const minmaxValues = {
            minValue: config.minvalue,
            maxValue: config.maxvalue,
        };

        drawWithTerrainRGB(gl, canvas, loadedImage, loadedColorMap, {
            ...minmaxValues,
            ...colorScale,
            ...shader,
        });
    } else {
        console.warn("Unrecognized shader: ", shader.type);
    }
};
