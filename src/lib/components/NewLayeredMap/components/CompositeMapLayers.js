import React, {Component} from "react";
import PropTypes from "prop-types";
import Context from '../context'

// Leaflet
import L from 'leaflet';
import '../layers/L.imageWebGLOverlay';
import '../layers/L.tileWebGLLayer';

// Utils
import { 
    getShapeType, 
    makePolyline,
    makePolygon,
    makeCircle,
    makeMarker,
    makeCircleMarker,
    addImage,
    addTile
} from '../utils/leaflet'

// Helper functions
const yx = ([x, y]) => {
    return [y, x];
};

// Constants
const DEFAULT_BOUNDS = [[0, 0], [30, 30]];

class CompositeMapLayers extends Component {


    constructor(props) {
        super(props);

        this.state = {
            layers: {
                
            },
            layerControl: null,
            drawings: {
                marker: null,
                circleMarker: null,
                polygon: null,
                polyline: null,
            }
        }
    }

    componentDidMount() {
        const layerControl = L.control.layers([]).addTo(this.props.map);
        this.setState({layerControl: layerControl}, () => this.createMultipleLayers())
        this.updateColorbarUponBaseMapChange();
    }

    updateLayer = (curLayer, newLayer) => {
        switch(newLayer.data[0].type) {  
            case 'image':
                curLayer.getLayers()[0].updateOptions({
                    ...newLayer.data[0],
                });
                break;

            case 'tile':
                curLayer.getLayers()[0].updateOptions({
                    ...newLayer.data[0],
                });
                break;
        }
    }
    
    componentDidUpdate(prevProps) {
        if (this.props.syncedMaps) {
            this.reSyncDrawLayer();
        }
        if (prevProps.layers !== this.props.layers) {
            const layers = (this.props.layers || []).filter(layer => layer.id);
            for (const propLayerData of layers) {
                switch(propLayerData.action) {
                    case "update":
                        const stateLayer = this.state.layers[propLayerData.id]
                        if (stateLayer) {
                            this.updateLayer(stateLayer, propLayerData);
                        }
                        break;

                    case "delete":
                        if (this.state.layers[propLayerData.id]) {
                            const stateLayer = this.state.layers[propLayerData.id];
                            stateLayer.remove();
                            this.state.layerControl.removeLayer(stateLayer);
                            this.removeLayerFromState(propLayerData.id);
                        }
                        break;

                    case "add":
                        if (!this.state.layers[propLayerData.id]) {
                            this.createLayerGroup(propLayerData);
                        }
                        break; 

                    default:
                        break;
                }
            }
        }
    }

    componentWillUnmount() {
        const map = this.props.map
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });
    }

    // Assumes that coordinate data comes in on the format of (y,x) by default
    addItemToLayer(item, layerGroup, swapXY = true) {
        switch(item.type) {
            case "polyline":
                layerGroup.addLayer(makePolyline(item, swapXY, this.props.lineCoords));
                break;

            case "polygon":
                layerGroup.addLayer(makePolygon(item, swapXY, this.props.polygonCoords));
                break;

            case "circle":
                layerGroup.addLayer(makeCircle(item, swapXY));
                break;
            
            case "circleMarker":
                layerGroup.addLayer(makeCircleMarker(item, swapXY));
                break;
            
            case "marker":
                layerGroup.addLayer(makeMarker(item, swapXY));
                break;
                
            case "image":
                const imageLayer = addImage(item, swapXY);
                layerGroup.addLayer(imageLayer);
                
                const checked = item.checked == true && item.baseLayer == true ? true : false; // TODO: item.checked = undefined now
                if (checked) {
                    this.setFocusedImageLayer(imageLayer);
                }

                imageLayer.onLayerChanged && imageLayer.onLayerChanged((imgLayer) => {
                    this.setFocusedImageLayer(imgLayer);
                });
                break;
            case "tile": 
                layerGroup.addLayer(addTile(item, swapXY));
                break;

            default:
                break; // add error message here?
          }
    }

    updateColorbarUponBaseMapChange = () => {
        this.props.map.on('baselayerchange', (e) => {
            this.setFocusedImageLayer(Object.values(e.layer._layers)[0]);
        });
    }

    addScaleLayer = (map) => {
        L.control.scale({imperial: false, position: "bottomright"}).addTo(map);
    }

    removeLayerFromState = (id) => {
        this.setState(prevState => {
           const newLayers = Object.assign({}, prevState.layers);
           delete newLayers[id];
           return {
               layers: newLayers
           };
        });
    }

    createMultipleLayers() {
        this.addScaleLayer(this.props.map);
        const layers = this.props.layers;
        for (const layer of layers) {
            this.createLayerGroup(layer);
        }
        this.addDrawLayerToMap();
        
    }

    createLayerGroup = (layer) => {
        const layerGroup = L.featureGroup();

        // To make sure one does not lose data due to race conditions 
        this.setState(prevState => ({
            layers: Object.assign({}, prevState.layers, {[layer.id]: layerGroup})
        }));

        //adds object to a layer
        for (const item of layer.data) {
            this.addItemToLayer(item, layerGroup);
        }

        if(layer.checked) {
            layerGroup.addTo(this.props.map);
        }

        // adds layers to the layerControl
        if(layer.baseLayer) {
            this.state.layerControl.addBaseLayer(layerGroup, layer.name);

            // Fits the map bounds if layer is a base layer
            // TODO: improve bounds optimization?
            if(layer.data && layer.data.length > 0) {
                const bounds = layer.data[0].bounds ? layer.data[0].bounds.map(xy => yx(xy)) : DEFAULT_BOUNDS;
                this.props.map.fitBounds(bounds);
            }

        } else {
            this.state.layerControl.addOverlay(layerGroup, layer.name);
        }
    }

    addDrawLayerToMap = () => {
        this.setState(prevState => ({
            layers: Object.assign({}, prevState.layers, {drawLayer: this.context.drawLayer})
        }));

        this.context.drawLayer.addTo(this.props.map);
        this.state.layerControl.addOverlay(this.context.drawLayer, "Drawings");
    }

    setFocusedImageLayer = (layer) => { 
        const updateFunc = this.context.setFocusedImageLayer;
        if(updateFunc) {
            updateFunc(layer);
        }
    }

    reSyncDrawLayer = () => {
        /**
         * For some reason moving the marker while using multiple maps in dash
         * throws an error in leaflet. Everything works fine as long as this is
         * surrounded in a try catch
         */ 
        try {
            this.context.drawLayer.clearLayers();
        } catch (error) {}

        const itemsToDraw = {}

        for (const item of this.context.syncedDrawLayer.data) {
            if (this.props.syncedMaps.includes(item.creatorId)) {
                this.props.syncDrawings ? this.addItemToLayer(item, this.context.drawLayer, false) : itemsToDraw[item.type] = item;
            }   
        }

        for (const item of this.context.drawLayerData) {
            if (!itemsToDraw[item.type] || itemsToDraw[item.type].creationTime < item.creationTime) {
                this.addItemToLayer(item, this.context.drawLayer, false);
                delete itemsToDraw[item.type]
            }
        }

        Object.values(itemsToDraw).forEach(item => {
            this.addItemToLayer(item, this.context.drawLayer, false);
        })     
    }

    
  
    render() {
        return null;
    }
    
}
CompositeMapLayers.contextType = Context;

CompositeMapLayers.propTypes = {

    map: PropTypes.object.isRequired,

    /* Data for one single layer. See parent component LayeredMap for documentation.
     */
    layers: PropTypes.array,

    /* Coordinates for selected polyline*/
    lineCoords: PropTypes.func,

    /* Coordinates for selected polygon*/
    polygonCoords: PropTypes.func,

};

export default CompositeMapLayers;