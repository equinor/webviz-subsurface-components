import L, { latLngBounds, Util, DomUtil, Bounds, Point} from 'leaflet';
import drawFunc from '../webgl/drawFunc';

// Utils
import { loadImage } from '../webgl/webglUtils';

/**
 * ImageWebGLOverlay is a layer that draws an image into the map
 * with help of WebGL. This opens up for usages for colormaps and
 * different kinds of shaders.
 */
L.ImageWebGLOverlay = L.Layer.extend({

    initialize: function(url, bounds, options) {
        this._url = url;
        this.setBounds(bounds);
        this._CRS = options.CRS || null;

        this._colormap = options.colormap || '';

		Util.setOptions(this, options);
    },

    onAdd: function(map) {
        this._map = map;
        if(!this._canvas) {
            this._initCanvas();
        }
        
        this.getPane().appendChild(this._canvas);
        this._reset();
    },

    onRemove: function(map) {
        this._map = map;
        if (!this._map) {
            return
        }
        if (this._canvas) {
            this._canvas.remove();
        }
    },

    getEvents: function() {

        const events = {
			zoom: this._reset,
			viewreset: this._reset
        };

        if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}
        
        return events;

    },

    getBounds: function () {
		return this._bounds;
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
    
    /**
     * @returns {HTMLCanvasElement} Returns the canvas element
     */
    getElement: function() {
        return this._canvas;
    },


    // ------ PRIVATE FUNCTIONS -------

    _initCanvas: function() {
        const canvasTag =  DomUtil.create('canvas');
        
        // Add neccessary CSS-classes
        DomUtil.addClass(canvasTag, 'leaflet-canvas-layer');
		if (this._zoomAnimated) { DomUtil.addClass(canvasTag, 'leaflet-zoom-animated'); }

        // TODO: Replace this function with custom draw function
        drawFunc(canvasTag, this._url, this._colormap)
        
        this._canvas = canvasTag;
    },

    _reset: function() {
        const canvas = this._canvas;
        const bounds = this._calcBounds();
        const size = bounds.getSize();


        // Update the position of the canvas-element
        DomUtil.setPosition(canvas, bounds.min);

        canvas.style.width = `${size.x}px`;
        canvas.style.height = `${size.y}px`;
    },

    _animateZoom: function (e) {
		const scale = this._map.getZoomScale(e.zoom);
        const offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;

		DomUtil.setTransform(this._canvas, offset, scale);
    },
    
    _updateZIndex: function () {
		if (this._canvas && this.options.zIndex) {
			this._canvas.style.zIndex = this.options.zIndex;
		}
    },
    
    _calcBounds: function() {
        const northWest = this._bounds.getNorthWest();
        const southEast = this._bounds.getSouthEast();
      
        return new Bounds(
            this._map.latLngToLayerPoint(northWest),
            this._map.latLngToLayerPoint(southEast)
        );
    }

});


L.imageWebGLOverlay = (url, bounds, options = {}) => {
    return new L.ImageWebGLOverlay(url, bounds, options);
}