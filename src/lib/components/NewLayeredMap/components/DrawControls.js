import React, { Component } from "react";
import PropTypes from "prop-types";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { NewLayeredMap } from "../../../index";
import Context from '../Context'

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
    if (layer instanceof L.CircleMarker) {
        return "circleMarker";
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


    removeLayers(layerType, featureGroup) {
        const layerContainer = featureGroup.options.edit.featureGroup
        const layers = layerContainer._layers;
        const layer_ids = Object.keys(layers);
        for (let i = 0; i < layer_ids.length - 1; i++) {
            const layer = layers[layer_ids[i]];
            if (getShapeType(layer) === layerType) {
                layerContainer.removeLayer(layer._leaflet_id);
            }
        }
    }

    addToolbar = (map) => {
        const drawControl = new L.Control.Draw({
            position: this.props.position,
            edit : {
                featureGroup: this.context.drawLayer
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

        map.on(L.Draw.Event.CREATED, (e) => {
            const type = e.layerType;
            const layer = e.layer;
            this.context.drawLayer.addLayer(layer)
            
            if (props.syncDrawings) {
                this.context.syncedDrawLayerDelete(type);
                const newLayer = {type: type}
            }
            switch(type) {
                case "polyline":
                    const coords = layer._latlngs.map(p => {
                        return [p.lat, p.lng];
                    });
                    props.syncDrawings && (newLayer["positions"] = coords);
                    this.props.lineCoords(coords);
                    this.removeLayers("polyline", drawControl);
                    break;

                case "polygon":
                    const coords = layer._latlngs[0].map(p => {
                        return [p.lat, p.lng];
                    });
                    props.syncDrawings && (newLayer["positions"] = coords);
                    this.props.polygonCoords(coords); 
                    this.removeLayers("polygon", drawControl);
                    break;

                case "marker":
                    props.syncDrawings && (newLayer["position"] = [layer._latlng.lat, layer._latlng.lng]);
                    this.props.markerCoords([layer._latlng.lat, layer._latlng.lng]);
                    this.removeLayers("marker", drawControl);
                    break;
            }
            props.syncDrawings && (this.context.syncedDrawLayerAdd([newLayer]));
        });
        
    
        map.on(L.Draw.Event.EDITED, (e) => {
            if (props.syncDrawings) {
                const newLayers = []
            }
            e.layers.eachLayer(layer => {
                const layerType = getShapeType(layer);
                if (props.syncDrawings) {
                    this.context.syncedDrawLayerDelete([layerType]);
                    const editedLayer = {type: layerType}
                }
                switch(layerType) {
                    case "polyline":
                        const coords = layer._latlngs.map(p => {
                            return [p.lat, p.lng];
                        });
                        props.syncDrawings && (editedLayer["positions"] = coords);
                        this.props.lineCoords(coords);
                        break;

                    case "polygon":
                        const coords = layer._latlngs[0].map(p => {
                            return [p.lat, p.lng];
                        });
                        props.syncDrawings && (editedLayer["positions"] = coords);
                        this.props.polygonCoords(coords);
                        break;

                    case "marker":
                        props.syncDrawings && (editedLayer["position"] = [layer._latlng.lat, layer._latlng.lng]);
                        this.props.markerCoords([layer._latlng.lat, layer._latlng.lng]);
                        break;
                    
                    case "circleMarker":
                        props.syncDrawings && (editedLayer["center"] = [layer._latlng.lat, layer._latlng.lng]);
                        console.log(editedLayer)
                        break;
                }
                props.syncDrawings && (newLayers.push(editedLayer));
            });
            props.syncDrawings && (this.context.syncedDrawLayerAdd(newLayers));
        });

        map.on(L.Draw.Event.DELETED, (e) => {
            
            if (props.syncDrawings) {
                const deletedLayers = e.layers.getLayers().map(layer => getShapeType(layer));
                this.context.syncedDrawLayerDelete(deletedLayers, true);
            }
        })

        map.on('click', (e) => {
            const circleMarker = {
                type: "circleMarker",
                center: [e.latlng.lat, e.latlng.lng],
                color: "red",
                radius: 4,
            }
            this.context.drawLayer.addLayer(L.circleMarker(circleMarker.center, circleMarker));
            this.removeLayers("circleMarker", drawControl);
            if (props.syncDrawings) {
                this.context.syncedDrawLayerDelete(["circleMarker"]);
                this.context.syncedDrawLayerAdd([circleMarker]);
            }
        })

        map.addControl(drawControl);

    }

    render() {
        return (null);
    }
}
DrawControls.contextType = Context;


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

    /* Function to emit marker coordinates to dash */
    markerCoords: PropTypes.func,

    /* Function to emit polyline coordinates to dash */
    lineCoords: PropTypes.func,

    /* Function to emit polygon coordinates to dash */
    polygonCoords: PropTypes.func,

    /* Boolean to toggle sync drawing */
    syncDrawings: PropTypes.bool,
};

export default DrawControls;
