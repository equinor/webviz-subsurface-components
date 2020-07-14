import React, { Component } from "react";
import PropTypes from "prop-types";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { NewLayeredMap } from "../../../index";
import Context from '../Context'


//TODO : Feature? Add drawn images to a static object

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

    // TODO: make it so that only data stays here, and the layergroup is initiated in CML
    static syncedDrawLayer = {
        "name": "syncedDrawLayer",
        "id": 19, 
        "action": "update",
        "checked": true,
        "baseLayer": false,
        "data": [
            {
                "type": "marker",
                "position": [435200, 6478000],
                "tooltip": "This is a blue marker"
            },
            {
                "type": "polygon",
                "positions": [
                    [436204, 6475077],
                    [438204, 6480077],
                    [432204, 6475077]
                ],
                "color": "blue",
                "tooltip": "This is a blue polygon"
            }
        ]
    }

    

    constructor(props) {
        this.addToolbar = this.addToolbar.bind(this);
    }

    
    componentDidMount() {
        const { drawPolygon, drawMarker, drawPolyline } = this.props;
        this.addToolbar(this.props.map);
        console.log(this.context.syncedDrawLayer)
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
        const drawControl = new L.Control.Draw({
            position: this.props.position,
            edit : {
                featureGroup: this.context.drawLayer
            },
            draw: {
                rectangle: false,
                circle: false,
                circlemarker: true,
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
                // DrawControls.syncedDrawLayer.data = DrawControls.syncedDrawLayer.data.filter((drawing) => {
                //     return drawing.type !== type;
                // })
                this.context.syncedDrawLayerDelete(type);
                const newLayer = {type: type}
            }

            if (type === "marker") {
                props.syncDrawings && (newLayer["position"] = [layer._latlng.lat, layer._latlng.lng]);
                this.removeLayers("marker", drawControl);
            }
            if (type === "polyline") {
                const coords = layer._latlngs.map(p => {
                    return [p.lat, p.lng];
                });
                this.removeLayers("polyline", drawControl);
                props.syncDrawings && (newLayer["positions"] = coords);
            }
            if (type === "polygon") {
                const coords = layer._latlngs[0].map(p => {
                    return [p.lat, p.lng];
                });
                props.syncDrawings && (newLayer["positions"] = coords); 
                this.removeLayers("polygon", drawControl);
                
            }
            if (props.syncDrawings) {
                this.context.syncedDrawLayerAdd(newLayer);
                console.log(this.context.drawLayer.getLayers())
            }
         });
        
    
        map.on(L.Draw.Event.EDITED, (e) => {
            e.layers.eachLayer(layer => {
                const layertype = getShapeType(layer);
                if (layertype === "polyline") {
                    const coords = layer._latlngs.map(p => {
                        return [p.lat, p.lng];
                    });
                    // props.syncDrawings && ()
                }
                if (layertype === "polygon") {
                    const coords = layer._latlngs[0].map(p => {
                        return [p.lat, p.lng];
                    });
                    // props.syncDrawings && ()
                }
                if (layertype === "marker") {
                    // props.syncDrawings && ()
                }
            });
         });

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

    /* Coordinates for selected marker*/
    markerCoords: PropTypes.func,

    /* Coordinates for selected polyline*/
    lineCoords: PropTypes.func,

    /* Coordinates for selected polygon*/
    polygonCoords: PropTypes.func,
};

export default DrawControls;
