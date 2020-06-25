import L, { DomUtil, DomEvent, Util, Browser, GridLayer } from 'leaflet';
import drawFunc from '../webgl/draw';

L.TileWebGLLayer = L.GridLayer.extend({

    options: {
		minZoom: 0,
		maxZoom: 18,
		errorTileUrl: '',
		zoomOffset: 0,
        zoomReverse: false,
        crossOrigin: false,
	},

    initialize: function(url, colormap, options) {
        this._url = url;
        this._colormap = colormap;
        this._canvas = null;
        this._glContext;
		
        options = Util.setOptions(this, options);
		// for https://github.com/Leaflet/Leaflet/issues/137
		if (!Browser.android) {
			this.on('tileunload', this._onTileRemove);
		}
    },

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
        L.GridLayer.prototype.onAdd.call(this, map);

        const canvas = this._canvas = DomUtil.create('canvas');

        this._glContext = canvas.getContext("webgl", {
            premultipliedAlpha: false,
        });
    },

    createTile: function(coords, done) {
        const tile = DomUtil.create('img');

        drawFunc(this._glContext, this._canvas, this.getTileUrl(coords), this._colormap, {
			crossOrigin: '',
		})
		.then((glContext) => {
            const image = this._canvas.toDataURL();
			tile.src = image;
			done(null, tile);
		})

		return tile;
    },

    getTileUrl: function (coords) {
		var data = {
            s: 'a',
			x: coords.x,
			y: coords.y,
			z: this._getZoomForUrl()
		};
		if (this._map && !this._map.options.crs.infinite) {
			const invertedY = this._globalTileRange.max.y - coords.y;
			if (this.options.tms) {
				data['y'] = invertedY;
			}
			data['-y'] = invertedY;
		}

        // Insert the {x, y, z} values from the data object into the url-template.
		return Util.template(this._url, Util.extend(data, this.options));
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

});

L.tileWebGLLayer = (url, colormap, options = {}) => {
    return new L.TileWebGLLayer(url, colormap, options);
}

