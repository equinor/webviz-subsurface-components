import L, { latLngBounds, Util, DomUtil, Bounds, Point} from 'leaflet';
import drawFunc from '../webgl/drawFunc';
import { buildColormapFromHexColors, DEFAULT_COLORSCALE_CONFIG } from '../colorscale';

// Utils
import { loadImage } from '../webgl/webglUtils';

/**
 * ImageWebGLOverlay is a layer that draws an image into the map
 * with help of WebGL. This opens up for usages for colormaps and
 * different kinds of shaders.
 */
L.ImageWebGLOverlay = L.Layer.extend({

    options: {

        /**
         * @param {Array<String>} - An array of hexcolors for defining the colormap used on the tiles.
         */
        colorScale: ["#FFFFFF", "#000000"],
    },

    initialize: function(url, bounds, options) {
        this._url = url;
        this.setBounds(bounds);
        this._CRS = options.CRS || null;

        Util.setOptions(this, options);

        this._emitURL();
    },

    onAdd: function(map) {
        this._map = map;
  
        if(!this._onscreenCanvas) {
            this._initColormap();
            this._initCanvas();
        }
        
        this.getPane().appendChild(this._onscreenCanvas);

        this._reset();
    },

    onRemove: function(map) {
        this._map = map;
        if (!this._map) {
            return
        }

        if (this._onscreenCanvas) {
            this._onscreenCanvas.remove();
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

    updateOptions: function(options) {
        options = Util.setOptions(this, {
			...this.options,
			...options,
        });
        
        if(options.url !== this._url) {
            this._url = options.url;
            this._emitURL();
        }

		this._initColormap();
		this._draw();
    },


    // ------ PRIVATE FUNCTIONS -------

    _emitURL: function() {
        const event = new Event('imageOverlayURL', { url: this._url });
        window.dispatchEvent(event);
    },

    _initCanvas: function() {
        const canvasTag =  DomUtil.create('canvas');
        const onscreenCanvasTag = DomUtil.create('canvas');

        
        const gl = this._gl = canvasTag.getContext("webgl", {
            premultipliedAlpha: false
        })
        
        // Add neccessary CSS-classes
        DomUtil.addClass(onscreenCanvasTag, 'leaflet-canvas-layer');
        if (this._zoomAnimated) { DomUtil.addClass(onscreenCanvasTag, 'leaflet-zoom-animated'); }

        this._onscreenCanvas = onscreenCanvasTag;
        this._canvas = canvasTag;
        this._draw();
    },

    _draw: function() {
        drawFunc(this._gl, this._canvas, this._url, this._colormapUrl, {
            ...this.options,
            shader: this.options.shader,
            scale: this.options.colorScale.scale,
            cutoffPoints: this.options.cutoffPoints,
        })
        .then(() => {
            // Draw from the webgl-canvas to the onscreenCanvas
            const ctx = this._onscreenCanvas.getContext("2d");
            this._onscreenCanvas.width = this._canvas.width;
            this._onscreenCanvas.height = this._canvas.height;
            ctx.drawImage(this._canvas, 0, 0);
        })
    },

    _initColormap: function() {
        const colorScale = this.options.colorScale;
        const cutOffpoints = this.options.cutoffPoints;

        if(typeof colorScale === 'string') {
            // The given colorScale is a base64 image
            this._colormapUrl = colorScale;
        } 
        else if(Array.isArray(colorScale)) {
            // The given colorScale is an array of hexColors
            const colors = colorScale;
            this._colormapUrl = buildColormapFromHexColors(colors, cutOffpoints);
        } 
        else if(typeof colorScale === 'object' && colorScale !== null) {
            // The given colorScale is an object
            /**
             * @type {import('../colorscale/index').ColorScaleConfig}
             */
            
            const colorScaleCfg = Object.assign({}, DEFAULT_COLORSCALE_CONFIG, colorScale || {});
            const colors = colorScaleCfg.colors;
            colorScaleCfg.cutOffPoints = cutOffpoints
            this._colormapUrl = buildColormapFromHexColors(colors, colorScaleCfg);
        }
    },

    _reset: function() {
        const canvas = this._canvas;
        const onscreenCanvas = this._onscreenCanvas;

        const bounds = this._calcBounds();
        const size = bounds.getSize();


        // Update the position of the canvas-element
        DomUtil.setPosition(canvas, bounds.min);
        DomUtil.setPosition(onscreenCanvas, bounds.min);

        onscreenCanvas.style.width = `${size.x}px`;
        onscreenCanvas.style.height = `${size.y}px`;
    },

    _animateZoom: function (e) {
		const scale = this._map.getZoomScale(e.zoom);
        const offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;
        DomUtil.setTransform(this._onscreenCanvas, offset, scale);
    },
    
    _updateZIndex: function () {
        if (this._onscreenCanvas && this.options.zIndex) {
			this._onscreenCanvas.style.zIndex = this.options.zIndex;
		}
    },
    
    _calcBounds: function() {
        const northWest = this._bounds.getNorthWest();
        const southEast = this._bounds.getSouthEast();
      
        return new Bounds(
            this._map.latLngToLayerPoint(northWest),
            this._map.latLngToLayerPoint(southEast)
        );
    },

});


L.imageWebGLOverlay = (url, bounds, options = {}) => {
    return new L.ImageWebGLOverlay(url, bounds, options);
}