/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import L from "leaflet";
import React from "react";
import ReactDOM from "react-dom";
import { withLeaflet, MapControl } from "react-leaflet";
import PropTypes from "prop-types";
import Slider from "@material-ui/core/Slider";

class VerticalZoom extends MapControl {
    constructor(props) {
        super(props);
        this.updateVerticalZoom(this.props.scaleY);

        const { map } = this.props.leaflet;
        this.leafletElement.addTo(map);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.scaleY !== this.props.scaleY) {
            this.updateVerticalZoom(this.props.scaleY);
        }
    }

    handleChange(_, scaleY) {
        this.updateVerticalZoom(scaleY);
    }

    updateVerticalZoom(scaleY) {
        const { map } = this.props.leaflet;
        const center = map.getCenter();

        map.options.crs = L.extend({}, L.CRS.Simple, {
            projection: L.Projection.LonLat,
            transformation: new L.Transformation(1, 0, -scaleY, 0),
        });

        map.setView(center);
        map._resetView(map.getCenter(), map.getZoom());
    }

    componentDidMount() {
        // Overriding default MapControl implementation. We need to do the
        // addTo(map) call in the constructor in order for the portal
        // DOM node to be available for the render function.
    }

    createLeafletElement(props) {
        const MapInfo = L.Control.extend({
            onAdd: () => {
                this.panelDiv = L.DomUtil.create(
                    "div",
                    "leaflet-custom-control"
                );

                this.panelDiv.addEventListener("mouseover", () =>
                    this.props.leaflet.map.dragging.disable()
                );
                this.panelDiv.addEventListener("mouseout", () =>
                    this.props.leaflet.map.dragging.enable()
                );

                this.panelDiv.style.height = "200px";
                this.panelDiv.style.paddingBottom = "10px";
                this.panelDiv.style.paddingTop = "10px";

                return this.panelDiv;
            },
        });
        return new MapInfo({ position: props.position });
    }

    render() {
        return ReactDOM.createPortal(
            <Slider
                orientation="vertical"
                valueLabelDisplay="auto"
                defaultValue={1}
                min={this.props.minScaleY}
                max={this.props.maxScaleY}
                onChange={this.handleChange.bind(this)}
            />,
            this.panelDiv
        );
    }
}

VerticalZoom.defaultProps = {
    scaleY: 1,
    minScaleY: 1,
    maxScaleY: 10,
};

VerticalZoom.propTypes = {
    /**
     * The scale of the y axis (relative to the x axis).
     * A value >1 increases the visual length of the
     * y axis compared to the x axis.
     */
    scaleY: PropTypes.number,

    /**
     * Minimum allowed scaleY
     */
    minScaleY: PropTypes.number,

    /**
     * Maximum allowed scaleY
     */
    maxScaleY: PropTypes.number,
};

export default withLeaflet(VerticalZoom);
