import React, { Component } from "react";
import PropTypes from "prop-types";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";

// work around broken icons when using webpack, see https://github.com/PaulLeCam/react-leaflet/issues/255

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/**  Leaflet-draw:edit event does not return marker type.
 *    Helper function to find marker type.
 *    https://stackoverflow.com/questions/18014907/leaflet-draw-retrieve-layer-type-on-drawedited-event
 **/

const getShapeType = layer => {
    if (layer instanceof L.Rectangle) {
        return "rectangle";
    }
    if (layer instanceof L.Circle) {
        return "circle";
    }
    if (layer instanceof L.Marker) {
        return "marker";
    }
    if (layer instanceof L.Polygon) {
        return "polygon";
    }
    if (layer instanceof L.Polyline) {
        return "polyline";
    }
    throw new Error("Unknown shape type");
};

class DrawControls extends Component {
    _onEdited(e) {
        e.layers.eachLayer(layer => {
            const layertype = getShapeType(layer);
            if (layertype === "polyline") {
                const coords = layer._latlngs.map(p => {
                    return [p.lat, p.lng];
                });
                this.props.lineCoords(coords);
            }
            if (layertype === "polygon") {
                const coords = layer._latlngs[0].map(p => {
                    return [p.lat, p.lng];
                });
                this.props.polygonCoords(coords);
            }
            if (layertype === "marker") {
                this.props.markerCoords([layer._latlng.lat, layer._latlng.lng]);
            }
        });
    }

    removeLayers(layertype) {
        const { edit } = this.refs; // eslint-disable-line react/no-string-refs
        const layerContainer = edit.leafletElement.options.edit.featureGroup;
        const layers = layerContainer._layers;
        const layer_ids = Object.keys(layers);
        for (let i = 0; i < layer_ids.length - 1; i++) {
            const layer = layers[layer_ids[i]];
            if (getShapeType(layer) === layertype) {
                layerContainer.removeLayer(layer._leaflet_id);
            }
        }
    }

    _onCreated(e) {
        console.log("woooooooooooow")
        const type = e.layerType;
        const layer = e.layer;
        if (type === "marker") {
            this.props.markerCoords([layer._latlng.lat, layer._latlng.lng]);
            this.removeLayers("marker");
        }
        if (type === "polyline") {
            const coords = layer._latlngs.map(p => {
                return [p.lat, p.lng];
            });
            this.props.lineCoords(coords);
            this.removeLayers("polyline");
        }
        if (type === "polygon") {
            const coords = layer._latlngs[0].map(p => {
                return [p.lat, p.lng];
            });
            this.props.polygonCoords(coords);
            this.removeLayers("polygon");
        }
    }

    addToolbar(map) {
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        const drawControl = new L.Control.Draw({
            position: 'topright',

            draw: {
                rectangle: false,
                circle: true,
                circlemarker: false,
                polygon: this.props.drawPolygon,
                marker: this.props.drawMarker,
                polyline: this.props.drawPolyline,
            }
        });
        
        //TODO make this work as a separate function
        map.on(L.Draw.Event.CREATED, function (e) {
        console.log("this is working")

            const type = e.layerType;
            const layer = e.layer;
            if (type === "marker") {
                this.props.markerCoords([layer._latlng.lat, layer._latlng.lng]);
                this.removeLayers("marker");
            }
            if (type === "polyline") {
                const coords = layer._latlngs.map(p => {
                    return [p.lat, p.lng];
                });
                this.props.lineCoords(coords);
                this.removeLayers("polyline");
            }
            if (type === "polygon") {
                const coords = layer._latlngs[0].map(p => {
                    return [p.lat, p.lng];
                });
                this.props.polygonCoords(coords);
                this.removeLayers("polygon");
            }
         });
         map.on(L.Draw.Event.EDITED, function (e) {
            this._onEdited.bind(e);
         });


        map.addControl(drawControl);
    }


    render() {
        const { drawPolygon, drawMarker, drawPolyline } = this.props;
        this.addToolbar(this.props.map);
        return (
            <div> 
            </div>
        );
    }
}
DrawControls.defaultProps = {
    drawMarker: true,
    drawPolygon: true,
    drawPolyline: true,
    position: "topright",
    markerCoords: PropTypes.func,

    lineCoords: PropTypes.func,
    
    polygonCoords: PropTypes.func,
};

DrawControls.propTypes = {

    map: PropTypes.object.isRequired,

    position: PropTypes.string,
    /* Show marker button*/
    drawMarker: PropTypes.bool,

    /* Show polygon button*/
    drawPolygon: PropTypes.bool,

    /* Show polyline button*/
    drawPolyline: PropTypes.bool,

    /* Coordinates for selected marker*/
    markerCoords: PropTypes.func,

    /* Coordinates for selected polyline*/
    lineCoords: PropTypes.func,

    /* Coordinates for selected polygon*/
    polygonCoords: PropTypes.func,
};

export default DrawControls;
