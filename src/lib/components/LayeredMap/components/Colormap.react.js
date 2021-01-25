/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import L from "leaflet";
import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { withLeaflet, MapControl } from "react-leaflet";

class Colormap extends MapControl {
    constructor(props) {
        super(props);

        const { map } = this.props.leaflet;
        this.leafletElement.addTo(map);
    }

    createLeafletElement(props) {
        const MapInfo = L.Control.extend({
            onAdd: () => {
                this.panelDiv = L.DomUtil.create(
                    "div",
                    "leaflet-custom-control"
                );
                return this.panelDiv;
            },
        });
        return new MapInfo({ position: props.position });
    }

    componentDidMount() {
        // Overriding default MapControl implementation. We need to do the
        // addTo(map) call in the constructor in order for the portal
        // DOM node to be available for the render function.
    }

    render() {
        return ReactDOM.createPortal(
            <div className="leaflet-colorbar">
                <div className="leaflet-colorbar-image">
                    <img
                        src={this.props.colormap}
                        style={{ width: "100%", height: "10px" }}
                    />
                </div>
                <div>
                    {this.props.minvalue} {this.props.unit}
                </div>
                <div className="leaflet-colorbar-right-label">
                    {this.props.maxvalue} {this.props.unit}
                </div>
            </div>,
            this.panelDiv
        );
    }
}

Colormap.propTypes = {
    /* Colormap, given as base64 picture data string */
    colormap: PropTypes.string,

    /* Minimum value of color map */
    minvalue: PropTypes.number,

    /* Maximum value of color map */
    maxvalue: PropTypes.number,

    /* Unit to show in color map */
    unit: PropTypes.string,
};

export default withLeaflet(Colormap);
