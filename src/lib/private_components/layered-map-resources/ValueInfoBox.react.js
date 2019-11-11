import L from "leaflet";
import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { withLeaflet, MapControl } from "react-leaflet";

class ValueInfoBox extends MapControl {
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
            <div>
                UTMX: {this.props.x} m<br />
                UTMY: {this.props.y} m<br />
                Depth: {this.props.z} TVDmsl
                <br />
            </div>,
            this.panelDiv
        );
    }
}

ValueInfoBox.propTypes = {};

export default withLeaflet(ValueInfoBox);
