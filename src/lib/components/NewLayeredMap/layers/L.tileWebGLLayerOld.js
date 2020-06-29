import L, { DomUtil, DomEvent, Util, Browser, GridLayer } from 'leaflet';
import drawFunc from '../webgl/drawFunc';

import exampleData from '../../../../demo/example-data/new-layered-map.json';


L.TileWebGLLayer = L.GridLayer.extend({

    options: {
		minZoom: 0,
		maxZoom: 18,
		errorTileUrl: '',
		zoomOffset: 0,
        zoomReverse: false,
        crossOrigin: false,
	},

    initialize: function(url, options) {
        this._url = url;
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

    createTile: function(coords, done) {
        const tile = DomUtil.create('canvas');

        drawFunc(tile, this.getTileUrl(coords), exampleData.layers[0].data[0].colormap /* this.options.colormap || null */, {
			crossOrigin: '', //false, //'anonymous' , // this.options.crossOrigin === true ? '' : this.options.crossOrigin,
		})
		.then((glContext) => {
			tile.src = null;
			done(null, tile);
			tile.glContext = glContext;
			/* tile.glContext = glContext; */
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
	
	_onTileRemove: function ({coords, tile}) {
		if (!L.Browser.android) {
			tile.onload = () => {};
		}

		console.log(tile.glContext);
		// tile.glContext.getExtension('WEBGL_lose_context').loseContext();
	},

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

L.tileWebGLLayer = (url, options = {}) => {
    return new L.TileWebGLLayer(url, options);
}

