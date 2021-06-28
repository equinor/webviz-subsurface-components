/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import PropTypes from "prop-types";
import L from "leaflet";
import { MapLayer, withLeaflet } from "react-leaflet";

class CanvasOverlay extends MapLayer {
    constructor(props) {
        super(props);
        this._map = this.props.leaflet.map;
        this._bounds = L.latLngBounds(this.props.bounds);
    }

    createLeafletElement() {
        // Implementing this function is a requirement from react-leaflet
        return null;
    }

    _animateZoom(e) {
        L.DomUtil.setTransform(
            this.el,
            this._map._latLngBoundsToNewLayerBounds(
                this._bounds,
                e.zoom,
                e.center
            ).min,
            this._map.getZoomScale(e.zoom)
        );
    }

    _reset() {
        const bounds = new L.Bounds(
            this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
            this._map.latLngToLayerPoint(this._bounds.getSouthEast())
        );
        const size = bounds.getSize();

        L.DomUtil.setPosition(this.el, bounds.min);

        this.el.style.width = size.x + "px";
        this.el.style.height = size.y + "px";
    }

    componentDidMount() {
        this.el = L.DomUtil.create("canvas", "leaflet-zoom-animated");

        const LeafletCanvasLayer = L.Layer.extend({
            onAdd: (leafletMap) =>
                leafletMap.getPanes().overlayPane.appendChild(this.el),
            addTo: (leafletMap) => {
                leafletMap.addLayer(this);
                return this;
            },
            onRemove: () => L.DomUtil.remove(this.el),
            getEvents: () => {
                return {
                    zoom: this._reset.bind(this),
                    viewreset: this._reset.bind(this),
                    zoomanim: this._animateZoom.bind(this),
                };
            },
        });

        this.leafletElement = new LeafletCanvasLayer();
        super.componentDidMount();
        this.props.drawMethod(this.el);
        this._reset();

        this.el.onclick = (e) => {
            if (this.props.original_data.loaded) {
                const client_rect = this.el.getBoundingClientRect();
                const x = Math.floor(
                    ((e.clientX - client_rect.left) / client_rect.width) *
                        this.props.original_data.ImageData.width
                );
                const y = Math.floor(
                    ((e.clientY - client_rect.top) / client_rect.height) *
                        this.props.original_data.ImageData.height
                );

                // RGBA
                const NUMBER_COLOR_CHANNELS = 4;

                const NUMBER_DISCRETIZATION_LEVELS = 255;

                const z =
                    this.props.original_data.ImageData.data[
                        (y * this.props.original_data.ImageData.width + x) *
                            NUMBER_COLOR_CHANNELS
                    ];

                const z_string =
                    z > 0
                        ? `${Math.floor(
                              ((this.props.maxvalue - this.props.minvalue) *
                                  (z - 1)) /
                                  NUMBER_DISCRETIZATION_LEVELS +
                                  this.props.minvalue
                          )} ${this.props.unit}`
                        : null;
                this._map.fire("onlayeredmapclick", { z: z_string }, true);
            }
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.drawMethod !== prevProps.drawMethod) {
            this._bounds = L.latLngBounds(this.props.bounds);
            this._reset();
            this.props.drawMethod(this.el);
        }
    }

    componentWillUnmount() {
        L.DomUtil.remove(this.el);
    }
}

CanvasOverlay.propTypes = {
    /**
     * The bounds of the image data, given as [[xmin, ymin], [xmax, ymax]] (in physical coordinates).
     */
    bounds: PropTypes.array,

    /* Function which should be used for drawing the generated canvas */
    drawMethod: PropTypes.func,

    /* Minimum value of color map */
    minvalue: PropTypes.number,

    /* Maximum value of color map */
    maxvalue: PropTypes.number,

    /* Unit to show in color map */
    unit: PropTypes.string,
};

export default withLeaflet(CanvasOverlay);
