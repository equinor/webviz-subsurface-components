/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { ImageOverlay } from "react-leaflet";
import CanvasOverlay from "./CanvasOverlay.react";
import alter_image from "../webgl/alter_image";

class ImageOverlayWebGL extends Component {
    render() {
        if (typeof this.props.colormap === "undefined") {
            return (
                <ImageOverlay url={this.props.url} bounds={this.props.bounds} />
            );
        }

        this.original_data = { loaded: false };
        const image = new Image();
        image.onload = () => {
            const offscreen_canvas = document.createElement("canvas");
            const ctx = offscreen_canvas.getContext("2d");
            offscreen_canvas.width = image.width;
            offscreen_canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
            this.original_data.ImageData = ctx.getImageData(
                0,
                0,
                offscreen_canvas.width,
                offscreen_canvas.height
            );
            this.original_data.loaded = true;
        };
        image.src = this.props.url;

        return (
            <CanvasOverlay
                drawMethod={(canvas) =>
                    alter_image(
                        canvas,
                        this.props.url,
                        this.props.colormap,
                        this.props.hillShading,
                        this.props.elevationScale,
                        this.props.lightDirection
                    )
                }
                bounds={this.props.bounds}
                original_data={this.original_data}
                minvalue={this.props.minvalue}
                maxvalue={this.props.maxvalue}
                unit={this.props.unit}
            />
        );
    }
}

ImageOverlayWebGL.propTypes = {
    url: PropTypes.string,
    colormap: PropTypes.string,
    bounds: PropTypes.array,
    hillShading: PropTypes.bool,

    /**
     * Used in hillshading. Dictates relative ratio between vertical elevation
     * axis (z) and horizontal axes (x and y). The correct physical value would
     * be |(max z - min z) * (width image) / (max x - min x)|, or equivalently
     * be |(max z - min z) * (height image) / (max y - min y)|.
     * Note however that it is not crucial that the value is physically correct,
     * as the value here can be seen as an artistic choice.
     */
    elevationScale: PropTypes.number,

    /**
     * Light direction (array of length 3), used when hillShading is true.
     */
    lightDirection: PropTypes.array,

    /* Minimum value of color map */
    minvalue: PropTypes.number,

    /* Maximum value of color map */
    maxvalue: PropTypes.number,

    /* Unit to show in color map */
    unit: PropTypes.string,
};

export default ImageOverlayWebGL;
