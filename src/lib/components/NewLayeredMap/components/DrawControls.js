import React, { Component } from "react";
import PropTypes from "prop-types";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";


//TODO : Feature? Add drawn images to a .json file 

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

    constructor(props) {
        this.addToolbar = this.addToolbar.bind(this);
    }

    
    componentDidMount() {
        const { drawPolygon, drawMarker, drawPolyline } = this.props;
        this.addToolbar(this.props.map);
    }


    removeLayers(layertype, featureGroup) {
        const layerContainer = featureGroup.options.edit.featureGroup
        const layers = layerContainer._layers;
        const layer_ids = Object.keys(layers);
        for (let i = 0; i < layer_ids.length - 1; i++) {
            const layer = layers[layer_ids[i]];
            if (getShapeType(layer) === layertype) {
                layerContainer.removeLayer(layer._leaflet_id);
            }
        }
    }

    addToolbar = (map) => {
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        const drawControl = new L.Control.Draw({
            position: this.props.position,
            edit : {
                featureGroup: drawnItems
            },
            draw: {
                rectangle: false,
                circle: false,
                circlemarker: false,
                polygon: this.props.drawPolygon,
                marker: this.props.drawMarker,
                polyline: this.props.drawPolyline,
            }

        });
        
        let that = this;

        map.on(L.Draw.Event.CREATED, function (e) {
            const type = e.layerType;
            const layer = e.layer;
            drawnItems.addLayer(layer)


            if (type === "marker") {
                props.markerCoords([layer._latlng.lat, layer._latlng.lng]);
                that.removeLayers("marker", drawControl);
            }
            if (type === "polyline") {
                const coords = layer._latlngs.map(p => {
                    return [p.lat, p.lng];
                });
                props.lineCoords(coords);
                that.removeLayers("polyline", drawControl);
            }
            if (type === "polygon") {
                const coords = layer._latlngs[0].map(p => {
                    return [p.lat, p.lng];
                });
                props.polygonCoords(coords);
                that.removeLayers("polygon", drawControl);
            }
         });
        
    
        map.on(L.Draw.Event.EDITED, function (e) {
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
         });

        map.addControl(drawControl);
    }


    render() {

        return (null);
    }
}
DrawControls.defaultProps = {
    drawMarker: true,
    drawPolygon: true,
    drawPolyline: true,
    position: "topright",
    
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
