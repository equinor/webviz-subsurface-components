/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

// Leaflet
import L from "leaflet";
import "./L.VerticalZoom";

// Material UI Components
import { Slider } from "@material-ui/core";

class VerticalZoom extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.updateVerticalZoom = this.updateVerticalZoom.bind(this);
        this.onSliderValueChange = this.onSliderValueChange.bind(this);
    }

    componentDidMount() {
        this.createNewMapControl();

        if (this.props.scaleY) {
            this.updateVerticalZoom(this.props.scaleY);
        }
    }

    componentWillUnmount() {
        this.removeMapControl();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.scaleY !== this.props.scaleY) {
            this.updateVerticalZoom(this.props.scaleY);
        }
    }

    createNewMapControl() {
        this.removeMapControl();

        const verticalZoomCtrl = L.verticalZoom(this.props.position);
        verticalZoomCtrl.addTo(this.props.map);

        this.setState({
            verticalZoomCtrl: verticalZoomCtrl,
        });
    }

    removeMapControl() {
        if (!this.state.verticalZoomCtrl) {
            return;
        }

        this.state.verticalZoomCtrl.remove();
        this.setState({ verticalZoomCtrl: null });
    }

    onSliderValueChange(event, sliderValue) {
        this.updateVerticalZoom(sliderValue);
    }

    updateVerticalZoom(scaleY) {
        if (this.state.scaleY === scaleY) {
            return;
        }

        const map = this.props.map;
        const center = map.getCenter();
        const zoom = map.getZoom();

        map.options.crs = L.extend({}, L.CRS.Simple, {
            projection: L.Projection.LonLat,
            transformation: new L.Transformation(1, 0, -scaleY, 0),
        });

        map.setView(center, zoom);
        map._resetView(center, zoom);

        this.setState({ scaleY: scaleY });
    }

    render() {
        if (
            !this.state.verticalZoomCtrl ||
            !this.state.verticalZoomCtrl.panelDiv
        ) {
            return null;
        }

        return ReactDOM.createPortal(
            <Slider
                orientation="vertical"
                valueLabelDisplay="auto"
                defaultValue={1}
                min={this.props.minScaleY}
                max={this.props.maxScaleY}
                onChange={this.onSliderValueChange}
            />,
            this.state.verticalZoomCtrl.panelDiv
        );
    }
}

VerticalZoom.propTypes = {
    map: PropTypes.object.isRequired,

    scaleY: PropTypes.number,
    position: PropTypes.string,

    minScaleY: PropTypes.number,
    maxScaleY: PropTypes.number,
};

VerticalZoom.defaultProps = {
    position: "topleft",

    minScaleY: 1,
    maxScaleY: 10,
};

export default VerticalZoom;
