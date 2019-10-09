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
