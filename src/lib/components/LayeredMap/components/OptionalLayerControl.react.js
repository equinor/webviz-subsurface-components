/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import React from "react";
import PropTypes from "prop-types";
import { LayersControl } from "react-leaflet";

class OptionalLayerControl extends React.Component {
    render() {
        return this.props.showLayersControl ? (
            <LayersControl position="topright" hideSingleBase={true}>
                {this.props.children}
            </LayersControl>
        ) : (
            this.props.children
        );
    }
}

OptionalLayerControl.propTypes = {
    /* If to show the leaflet layer control */
    showLayersControl: PropTypes.bool,

    /* Children of the wrapper element */
    children: PropTypes.node,
};

export default OptionalLayerControl;
