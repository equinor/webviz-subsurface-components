/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import L, { latLngBounds, Util, DomUtil, Bounds } from "leaflet";
import drawFunc from "../webgl/drawFunc";
import Utils from "../utils";

/**
 * ImageWebGLOverlay is a layer that draws an image into the map
 * with help of WebGL. This opens up for usages for colormaps and
 * different kinds of shaders.
 */
L.ImageWebGLOverlay = L.Layer.extend({
    options: {
        crossOrigin: false,

        /**
         * @param {Array<String>} - An array of hexcolors for defining the colormap used on the tiles.
         */
        colorScale: null,

        /**
         * @param {Number} - If the image should scale into a different size
         */
        imageScale: null,

        /**
         * Default bounds
         */
        bounds: [
            [0, 0],
            [30, 30],
        ],
    },

    initialize: function (url, bounds, options) {
        this._url = url;
        Util.setOptions(this, {
            ...options,
            url,
        });
        this.setBounds(
            (bounds || []).length > 0 ? bounds : this.options.bounds
        );
    },

    onAdd: function (map) {
        this._map = map;

        if (!this._onscreenCanvas) {
            this._initColormap();
            this._initCanvas();
        }

        this.getPane().appendChild(this._onscreenCanvas);

        this._reset();

        this._triggerOnChanged();
    },

    onRemove: function (map) {
        this._map = map;
        if (!this._map) {
            return;
        }

        if (this._onscreenCanvas) {
            this._onscreenCanvas.remove();
        }
    },

    getEvents: function () {
        const events = {
            zoom: this._reset,
            viewreset: this._reset,
        };

        if (this._zoomAnimated) {
            events.zoomanim = this._animateZoom;
        }

        return events;
    },

    getBounds: function () {
        return this._bounds;
    },

    getUrl: function () {
        return this._url;
    },

    getCanvas: function () {
        return this._onscreenCanvas;
    },

    // ----- SETTERS -----

    setZIndex: function (value) {
        this.options.zIndex = value;
        this._updateZIndex();
        return this;
    },

    setBounds: function (bounds) {
        this._bounds = latLngBounds(bounds);

        if (this._map) {
            this._reset();
        }
        return this;
    },

    onLayerChanged: function (listener) {
        this._listener = listener;
    },

    updateOptions: function (options) {
        const promisesToWaitFor = [];

        if (
            options.colorScale &&
            options.colorScale instanceof Object &&
            this.options.colorScale instanceof Object
        ) {
            options.colorScale = Object.assign(
                {},
                this.options.colorScale,
                options.colorScale
            );
        }

        options = Util.setOptions(this, {
            ...this.options,
            ...options,
        });

        // Update the URL
        if (options.url !== this._url) {
            promisesToWaitFor.push(this._initUrl());
        }

        // Update the colorScale
        if (!options.colorScale) {
            this._colormapUrl = null;
        } else {
            this._initColormap();
        }

        Promise.all(promisesToWaitFor).then(() => {
            this._draw();
            this._triggerOnChanged();
        });
    },

    // ------ PRIVATE FUNCTIONS -------

    _initCanvas: function () {
        const canvasTag = DomUtil.create("canvas");
        const onscreenCanvasTag = DomUtil.create("canvas");

        this._gl = canvasTag.getContext("webgl", {
            premultipliedAlpha: false,
        });

        // Add neccessary CSS-classes
        DomUtil.addClass(onscreenCanvasTag, "leaflet-canvas-layer");
        if (this._zoomAnimated) {
            DomUtil.addClass(onscreenCanvasTag, "leaflet-zoom-animated");
        }

        this._onscreenCanvas = onscreenCanvasTag;
        this._canvas = canvasTag;

        this._initUrl().then(() => {
            this._draw();
        });
    },

    _initColormap: function () {
        const colorScale = this.options.colorScale;
        if (!colorScale) {
            this._colormapUrl = null;
        } else {
            this._colormapUrl = Utils.buildColormap(colorScale);
        }
    },

    _initUrl: function () {
        // Scale image if options.imageScale is provided
        let imageScale = this.options.imageScale;
        if (this.options.imageScale && imageScale > 0.0 && imageScale !== 1.0) {
            imageScale = Math.min(imageScale, 20.0); // Max is 20
            return Utils.scaleImage(
                this.options.url,
                imageScale,
                imageScale
            ).then((scaledImageUrl) => {
                this._url = scaledImageUrl;
            });
        } else {
            this._url = this.options.url;
            return Promise.resolve();
        }
    },

    _draw: function () {
        if (!this._gl) {
            console.warn(
                "ImageWebGLLayer is missing a webgl-context",
                this._leaflet_id
            );
            return;
        }

        drawFunc(this._gl, this._canvas, this._url, this._colormapUrl, {
            ...this.options,
            shader: this.options.shader,
            crossOrigin: this.options.crossOrigin || "",
        })
            .then(() => {
                // Draw from the webgl-canvas to the onscreenCanvas
                const ctx = this._onscreenCanvas.getContext("2d");
                this._onscreenCanvas.width = this._canvas.width;
                this._onscreenCanvas.height = this._canvas.height;
                ctx.drawImage(this._canvas, 0, 0);
            })
            .catch(console.error);
    },

    _reset: function () {
        const onscreenCanvas = this._onscreenCanvas;

        const bounds = this._calcBounds();
        const size = bounds.getSize();

        // Update the position of the canvas-element
        DomUtil.setPosition(onscreenCanvas, bounds.min);

        onscreenCanvas.style.width = `${size.x}px`;
        onscreenCanvas.style.height = `${size.y}px`;
    },

    _animateZoom: function (e) {
        const scale = this._map.getZoomScale(e.zoom);
        const offset = this._map._latLngBoundsToNewLayerBounds(
            this._bounds,
            e.zoom,
            e.center
        ).min;
        DomUtil.setTransform(this._onscreenCanvas, offset, scale);
    },

    _updateZIndex: function () {
        if (this._onscreenCanvas && this.options.zIndex) {
            this._onscreenCanvas.style.zIndex = this.options.zIndex;
        }
    },

    _calcBounds: function () {
        const northWest = this._bounds.getNorthWest();
        const southEast = this._bounds.getSouthEast();

        return new Bounds(
            this._map.latLngToLayerPoint(northWest),
            this._map.latLngToLayerPoint(southEast)
        );
    },

    _triggerOnChanged: function () {
        if (this._listener) {
            this._listener(this);
        }
    },
});

L.imageWebGLOverlay = (url, bounds, options = {}) => {
    return new L.ImageWebGLOverlay(url, bounds, options);
};
