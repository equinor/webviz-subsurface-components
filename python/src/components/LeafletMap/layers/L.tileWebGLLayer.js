/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import L, { DomUtil, DomEvent, Util, Browser, GridLayer } from "leaflet";
import drawFunc from "../webgl/drawFunc";
import { buildColormap } from "../utils/colorScale";

import { tilesToImage } from "../utils/image";

const DRAW_STRATEGY_FULL = "full";

/**
 * TileWebGLLayer is a tileLayer for rendering tile-based images with WebGL. It executes WebGL code for colormaps and
 * shaders and then convert the drawn canvas into an image that will be assigned to a tile.
 */
L.TileWebGLLayer = L.GridLayer.extend({
    options: {
        /**
         * Min and Max zoom for the layer
         * @param {Number} minZoom - The min zoom of the layer
         * @param {Number} maxZoom - The max zoom of the layer
         */
        minZoom: 0,
        maxZoom: 18,

        /**
         * @param {String|Array<String>} subdomains - Subdomains for the tile service. Can either be a string or an array of strings.
         *
         * @example
         * subdomains = 'abc' => ['a', 'b', 'c']
         */
        subdomains: "abc",

        /**
         * @param {Number} zoomOffset: Number = 0
         * The zoom offset for tiles
         */
        zoomOffset: 0,

        /**
         * @param {Boolean} zoomReverse - If true, reverses the zoom number used in URL tiles.
         */
        zoomReverse: false,

        /**
         * @param {Boolean|String} - A cross-origin attribute that should be added to the tiles.
         */
        crossOrigin: false,

        /**
         * @param {Array<String>} - An array of hexcolors for defining the colormap used on the tiles.
         */
        colorScale: null,

        /**
         * @param {String} - How one should draw the tiles. Can be either null, "adjacent", "full"
         */
        drawStrategy: null,
    },

    initialize: function (url, options) {
        this._url = url;
        this._canvas = null;
        (this._glContext = null),
            /**
             * Caching loaded images - used with drawStrategy "adjacent"
             * @type {Object.<HTMLImageElement>}
             */
            (this._loadedTiles = {});

        Util.setOptions(this, options);

        // for https://github.com/Leaflet/Leaflet/issues/137
        if (!Browser.android) {
            this.on("tileunload", this._onTileRemove);
        }

        if (options.drawStrategy === DRAW_STRATEGY_FULL) {
            this.on("load", () => {
                if (!this._isMounted) {
                    this._drawAllTiles();
                }
                this._isMounted = true;
            });
        }
    },

    /**
     * setUrl makes it possible to change the tileService URL to something else
     * @param {String} url - The TileService URL
     * @param {Boolean} noRedraw - A boolean indicates if one would like to redraw everything.
     */
    setUrl: function (url, noRedraw) {
        if (this._url === url && noRedraw === undefined) {
            noRedraw = true;
        }

        this._url = url;

        if (!noRedraw) {
            this.redraw();
        }
        return this;
    },

    onAdd: function (map) {
        const canvas = (this._canvas = DomUtil.create("canvas"));

        this._glContext = canvas.getContext("webgl", {
            premultipliedAlpha: false,
        });

        this._initColormap();
        L.GridLayer.prototype.onAdd.call(this, map);

        if (this.options.drawStrategy === DRAW_STRATEGY_FULL) {
            map.on("moveend", () => this._triggerFullDraw());
            map.on("zoomend", () => this._triggerFullDraw());
        }
    },

    onRemove: function (map) {
        map.off("moveend", () => this._triggerFullDraw());
        map.off("zoomend", () => this._triggerFullDraw());

        L.GridLayer.prototype.onRemove.call(this, map);
    },

    createTile: function (coords, done) {
        // Create image-tag and assign on load- and error-listeners
        const tile = DomUtil.create("canvas");
        DomEvent.on(
            tile,
            "load",
            Util.bind(this._tileOnLoad, this, done, tile)
        );
        DomEvent.on(
            tile,
            "error",
            Util.bind(this._tileOnError, this, done, tile)
        );
        tile.width = this.options.tileSize;
        tile.height = this.options.tileSize;

        // Make sure the image gets the correct crossOrigin attribute, due to CORS-issues.
        if (this.options.crossOrigin || this.options.crossOrigin === "") {
            tile.crossOrigin =
                this.options.crossOrigin === true
                    ? ""
                    : this.options.crossOrigin;
        }

        if (this.options.drawStrategy !== DRAW_STRATEGY_FULL) {
            this._draw(tile, coords, done);
        } else {
            setTimeout(() => done(null, tile), 1000);
        }

        return tile;
    },

    getTileUrl: function (coords) {
        var urlData = {
            s: this._getSubdomain(coords),
            x: coords.x,
            y: coords.y,
            z: this._getZoomForUrl(),
        };

        // Insert the {x, y, z} values from the data object into the url-template.
        return Util.template(this._url, Util.extend(urlData, this.options));
    },

    updateOptions: function (options) {
        Util.setOptions(this, {
            ...this.options,
            ...options,
        });

        this._initColormap();

        if (this.options.drawStrategy === DRAW_STRATEGY_FULL) {
            this._drawAllTiles();
        } else {
            this._redrawAllTiles();
        }
    },

    // ----------- PRIVATE FUNCTIONS ------------------

    _draw: async function (tile, coords, done) {
        const drawOptions = this._getDrawOptions();

        drawFunc(
            this._glContext,
            this._canvas,
            this.getTileUrl(coords),
            this._colormapUrl,
            drawOptions
        ).then(() => {
            const ctx = tile.getContext("2d");
            ctx.clearRect(0, 0, tile.width, tile.height);
            ctx.drawImage(this._canvas, 0, 0);

            if (done) {
                done(null, tile);
            }
        });
    },

    _redrawAllTiles: function () {
        for (let { el, coords } of Object.values(this._tiles || {})) {
            this._draw(el, coords, null);
        }
    },

    _drawAllTiles: async function () {
        const drawOptions = this._getDrawOptions();

        const tiles = Object.values(this._tiles || {})
            .filter((tile) => tile.current)
            .map((tile) => ({ ...tile, image: this.getTileUrl(tile.coords) }));

        // Merge the tiles into a single image
        const { url, size, minX, minY } = await tilesToImage(
            tiles,
            drawOptions
        );

        // Draw image
        drawFunc(
            this._glContext,
            this._canvas,
            url,
            this._colormapUrl,
            drawOptions
        ).then(() => {
            // Disitrbute parts of the drawn image onto corresponding tiles
            tiles.forEach(({ coords, el }) => {
                const x = coords.x - minX;
                const y = coords.y - minY;
                const ctx = el.getContext("2d");
                ctx.drawImage(
                    this._canvas,
                    x * size,
                    y * size,
                    size,
                    size,
                    0,
                    0,
                    size,
                    size
                );
            });
        });
    },

    _getZoomForUrl: function () {
        let zoom = this._tileZoom;
        let maxZoom = this.options.maxZoom;
        let zoomReverse = this.options.zoomReverse;
        let zoomOffset = this.options.zoomOffset;

        if (zoomReverse) {
            zoom = maxZoom - zoom;
        }

        return zoom + zoomOffset;
    },

    _onTileRemove: function (e) {
        e.tile.onload = null;
    },

    _getSubdomain: function (tilePoint) {
        var index =
            Math.abs(tilePoint.x + tilePoint.y) %
            this.options.subdomains.length;
        return this.options.subdomains[index];
    },

    _removeTile: function (key) {
        var tile = this._tiles[key];
        if (!tile) {
            return;
        }

        // Cancels any pending http requests associated with the tile
        // unless we're on Android's stock browser,
        // see https://github.com/Leaflet/Leaflet/issues/137
        if (!Browser.androidStock) {
            tile.el.setAttribute("src", Util.emptyImageUrl);
        }

        return GridLayer.prototype._removeTile.call(this, key);
    },

    _tileOnLoad: function (done, tile) {
        // For https://github.com/Leaflet/Leaflet/issues/3332
        if (Browser.ielt9) {
            setTimeout(Util.bind(done, this, null, tile), 0);
        } else {
            done(null, tile);
        }
    },

    _tileOnError: function (done, tile, e) {
        done(e, tile);
    },

    _initColormap: function () {
        const colorScale = this.options.colorScale;
        if (!colorScale) {
            this._colormapUrl = null;
        } else {
            this._colormapUrl = buildColormap(colorScale);
        }
    },

    _getDrawOptions: function () {
        return {
            ...this.options,
            crossOrigin: "",
        };
    },

    _triggerFullDraw: function () {
        if (this._fullDrawTimeout) {
            clearTimeout(this._fullDrawTimeout);
        }
        this._fullDrawTimeout = setTimeout(() => {
            this._drawAllTiles();
        }, 1200);
    },
});

L.tileWebGLLayer = (url, options = {}) => {
    return new L.TileWebGLLayer(url, options);
};
