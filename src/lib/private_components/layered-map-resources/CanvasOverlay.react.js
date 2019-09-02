import PropTypes from 'prop-types';
import L from 'leaflet';
import { MapLayer, withLeaflet } from 'react-leaflet';
import { toLatLngBounds } from 'leaflet/src/geo/LatLngBounds'
import {Bounds} from 'leaflet/src/geometry/Bounds';

class CanvasOverlay extends MapLayer {

    constructor(props) {
        super(props)
        this._map = this.props.leaflet.map
        this._bounds = toLatLngBounds(this.props.bounds)
    }

    createLeafletElement() {
        // Implementing this function is a requirement from react-leaflet
        return null;
    }

    _animateZoom(e) {
        L.DomUtil.setTransform(
            this.el,
            this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min,
            this._map.getZoomScale(e.zoom)
        )
    }

    _reset() {
        const bounds = new Bounds(
            this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
            this._map.latLngToLayerPoint(this._bounds.getSouthEast()))
        const size = bounds.getSize();

        L.DomUtil.setPosition(this.el, bounds.min);

        this.el.style.width  = size.x + 'px';
        this.el.style.height = size.y + 'px';
    }

    componentDidMount() {
        this.el = L.DomUtil.create('canvas', 'leaflet-zoom-animated')

        const LeafletCanvasLayer = L.Layer.extend({
            onAdd: (leafletMap) => leafletMap.getPanes().overlayPane.appendChild(this.el),
            addTo: (leafletMap) => {
                                    leafletMap.addLayer(this);
                                    return this;
                                   },
            onRemove: () => L.DomUtil.remove(this.el),
            getEvents: () => {
                return {
                    zoom: this._reset.bind(this),
                    viewreset: this._reset.bind(this),
                    zoomanim: this._animateZoom.bind(this)
                }
            }
        });

        this.leafletElement = new LeafletCanvasLayer()
        super.componentDidMount()
        this.props.drawMethod(this.el)
        this._reset()
    }

    componentDidUpdate(prevProps) {
        if (this.props.drawMethod !== prevProps.drawMethod) {
            this._bounds = toLatLngBounds(this.props.bounds)
            this._reset()
            this.props.drawMethod(this.el)
        }
    }

    componentWillUnmount() {
        L.DomUtil.remove(this.el)
    }

}

CanvasOverlay.propTypes = {
    /**
     * The bounds of the image data, given as [[xmin, ymin], [xmax, ymax]] (in physical coordinates).
     */
    bounds: PropTypes.array,

    /* Function which should be used for drawing the generated canvas */
    drawMethod: PropTypes.func
};

export default withLeaflet(CanvasOverlay)
