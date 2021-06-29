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
import MaterialSwitch from "@material-ui/core/Switch";

class Switch extends MapControl {
    constructor(props) {
        super(props);
        this.state = { checked: this.props.checked };

        const { map } = this.props.leaflet;
        this.leafletElement.addTo(map);
    }

    handleChange() {
        this.setState({ checked: !this.state.checked });
        this.props.onChange();
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
            <div style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                <MaterialSwitch
                    onClick={this.handleChange.bind(this)}
                    checked={this.state.checked}
                />
                {this.props.label}
            </div>,
            this.panelDiv
        );
    }
}

Switch.propTypes = {
    /* Label to be shown to the right of the switch */
    label: PropTypes.string,

    /* Callback function to call when switch changes */
    handleChange: PropTypes.func,

    /* Initial value of the swith */
    checked: PropTypes.bool,
};

export default withLeaflet(Switch);
