import L, { DomUtil, DomEvent, Util, Browser, GridLayer } from 'leaflet';
import drawFunc from '../webgl/drawFunc';
import { buildColormapFromHexColors, DEFAULT_COLORSCALE_CONFIG } from '../colorscale';

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
		subdomains: 'abc',

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
		colorScale: ["#FFFFFF", "#000000"],
	},

    initialize: function(url, options) {
        this._url = url;
		this._canvas = null;
		this._glContext = null,
		
		options = Util.setOptions(this, options);

		// for https://github.com/Leaflet/Leaflet/issues/137
		if (!Browser.android) {
			this.on('tileunload', this._onTileRemove);
		}
    },

	/**
	 * setUrl makes it possible to change the tileService URL to something else
	 * @param {String} url - The TileService URL
	 * @param {Boolean} noRedraw - A boolean indicates if one would like to redraw everything.
	 */
    setUrl: function(url, noRedraw) {
        if (this._url === url && noRedraw === undefined) {
			noRedraw = true;
		}

		this._url = url;

		if (!noRedraw) {
			this.redraw();
		}
		return this;

    },

    onAdd: function(map) {
		const canvas = this._canvas = DomUtil.create('canvas');

        this._glContext = canvas.getContext("webgl", {
            premultipliedAlpha: false,
		});
		
		this._initColormap();

        L.GridLayer.prototype.onAdd.call(this, map);
	},

    createTile: function(coords, done) {
		// Create image-tag and assign on load- and error-listeners
		const tile = DomUtil.create('img');
		DomEvent.on(tile, 'load', Util.bind(this._tileOnLoad, this, done, tile));
		DomEvent.on(tile, 'error', Util.bind(this._tileOnError, this, done, tile));

		// Make sure the image gets the correct crossOrigin attribute, due to CORS-issues.
		if (this.options.crossOrigin || this.options.crossOrigin === '') {
			tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
		}

        drawFunc(this._glContext, this._canvas, this.getTileUrl(coords), this._colormapUrl, {
			...this.options,
			crossOrigin: '',
			shader: this.options.shader,
		})
		.then(() => {
			const image = this._canvas.toDataURL();
			tile.alt = '';
			tile.src = image;
		})

		return tile;
    },

    getTileUrl: function (coords) {
		var urlData = {
            s: this._getSubdomain(coords),
			x: coords.x,
			y: coords.y,
			z: this._getZoomForUrl()
		};

        // Insert the {x, y, z} values from the data object into the url-template.
		return Util.template(this._url, Util.extend(urlData, this.options));
	},
	
	update: function (colormapUrl, options) {
		console.log("trying to update in TILELAYER")
        if (this._colormapUrl != colormapUrl) {
			console.log("changing the color map")		
			this._colormapUrl = colormapUrl;
		}
		
		options = Util.setOptions(this, {
			...this.options,
			...options,
		});
		this.redraw();
	},
    

	// ----------- PRIVATE FUNCTIONS ------------------

    _getZoomForUrl: function () {
		let zoom =          this._tileZoom;
		let maxZoom =       this.options.maxZoom;
		let zoomReverse =   this.options.zoomReverse;
		let zoomOffset =    this.options.zoomOffset;

		if (zoomReverse) {
			zoom = maxZoom - zoom;
		}

		return zoom + zoomOffset;
	},

	_onTileRemove: function (e) {
		e.tile.onload = null;
	},

	_getSubdomain: function (tilePoint) {
		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
		return this.options.subdomains[index];
	},

	_removeTile: function (key) {
		var tile = this._tiles[key];
		if (!tile) { return; }

		// Cancels any pending http requests associated with the tile
		// unless we're on Android's stock browser,
		// see https://github.com/Leaflet/Leaflet/issues/137
		if (!Browser.androidStock) {
			tile.el.setAttribute('src', Util.emptyImageUrl);
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

	_initColormap: function() {
		const colorScale = this.options.colorScale;
        if(typeof colorScale === 'string') {
            // The given colorScale is a base64 image
            this._colormapUrl = colorScale;
        } 
        else if(Array.isArray(colorScale)) {
            // The given colorScale is an array of hexColors
            const colors = colorScale;
            this._colormapUrl = buildColormapFromHexColors(colors);
        } 
        else if(typeof colorScale === 'object' && colorScale !== null) {
            // The given colorScale is an object
            /**
             * @type {import('../colorscale/index').ColorScaleConfig}
             */
            const colorScaleCfg = Object.assign({}, DEFAULT_COLORSCALE_CONFIG, colorScale);
            const colors = colorScaleCfg.colors;
            this._colormapUrl = buildColormapFromHexColors(colors, colorScaleCfg);
        }
	}

});

L.tileWebGLLayer = (url, options = {}) => {
    return new L.TileWebGLLayer(url, options);
}

