import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withLeaflet } from 'react-leaflet';
import  {EditControl}  from 'react-leaflet-draw';
import "./assets/leaflet.draw.css";
import L from 'leaflet';


// work around broken icons when using webpack, see https://github.com/PaulLeCam/react-leaflet/issues/255

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

/**  Leaflet-draw:edit event does not return marker type.
*    Helper function to find marker type.
*    https://stackoverflow.com/questions/18014907/leaflet-draw-retrieve-layer-type-on-drawedited-event
**/
var getShapeType = (layer) => {

    if (layer instanceof L.Circle) {
        return 'circle';
    }

    if (layer instanceof L.Marker) {
        return 'marker';
    }

    if ((layer instanceof L.Polyline) && ! (layer instanceof L.Polygon)) {
        return 'polyline';
    }

    if ((layer instanceof L.Polygon) && ! (layer instanceof L.Rectangle)) {
        return 'polygon';
    }

    if (layer instanceof L.Rectangle) {
        return 'rectangle';
    }
    return null

}

class DrawControls extends Component {

    _onEdited(e) {
        e.layers.eachLayer( (layer) => {
            const layertype = getShapeType(layer)
            if (layertype === 'polyline') {
                const coords = layer._latlngs.map(p => {
                  return [p.lat, p.lng]
                })
                this.props.lineCoords(coords)
            }
            if (layertype === 'marker') {
                this.props.markerCoords([layer._latlng.lat, layer._latlng.lng])  
            }
        })
    }
  
    removeLayers(layertype) {
        var {edit} = this.refs
        var layerContainer = edit.leafletElement.options.edit.featureGroup
        var layers = layerContainer._layers
        var layer_ids = Object.keys(layers)
        let layer
        for (var i = 0; i < layer_ids.length-1; i++) {
            layer = layers[layer_ids[i]]
            if (getShapeType(layer) === layertype) {
                layerContainer.removeLayer(layer._leaflet_id)
            }
        }
    }
  
    _onCreated(e) {
        const type = e.layerType
        const layer = e.layer
        if (type === 'marker') {
            this.props.markerCoords([layer._latlng.lat, layer._latlng.lng])
            this.removeLayers('marker')
        }
        if (type === 'polyline') {
                const coords = layer._latlngs.map(p => {
                return [p.lat, p.lng]
            })
            this.props.lineCoords(coords)
            this.removeLayers('polyline')
        }
    }

    render() {
        return (
            <EditControl
              ref={"edit"}
              position='topright'
              onEdited={this._onEdited.bind(this)}
              onCreated={this._onCreated.bind(this)}
              draw={{
                  rectangle: false,
                  circle: false,
                  polygon:false,
                  circlemarker: false
              }}/>
        )
    }
}

DrawControls.propTypes = {
    /* Coordinates for selected marker*/
    markerCoords: PropTypes.func,

    /* Coordinates for selected polyline*/
    lineCoords: PropTypes.func
};


export default withLeaflet(DrawControls)
