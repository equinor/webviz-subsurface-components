import React, {Component} from "react";
import PropTypes from "prop-types";
import Context from '../Context'

// Leaflet
import L from 'leaflet';
import '../layers/L.imageWebGLOverlay';
import '../layers/L.tileWebGLLayer';

// Components
import ColorBar from './ColorBar'

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

    addTooltip = (item, shapeObject) => {
        if ("tooltip" in item) {
            return shapeObject.bindTooltip(item.tooltip);
        }
        return shapeObject;
    }

    makePolyline = (item, swapXY) => {
        const pos = swapXY ? item.positions.map(xy => yx(xy)) : item.positions;
        return this.addTooltip(item, 
                    (L.polyline(pos, {
                        onClick: () => this.props.lineCoords(positions),
                        color: item.color || "blue",
                        positions: pos
                    })
        ));
    }

    makePolygon = (item, swapXY) => {
        const pos = swapXY ? item.positions.map(xy => yx(xy)) : item.positions;
        return this.addTooltip(item, 
                    (L.polygon(pos, {
                        onClick: () => this.props.polygonCoords(positions),
                        color: item.color || "blue",
                        positions: pos
                    })
        ));
    }

    makeMarker = (item, swapXY) => {
        const pos = swapXY ? yx(item.position): item.position;
        
        return  this.addTooltip(item, 
                    L.marker(pos)
        );
    }

    makeCircle = (item, swapXY) => {
        const center = swapXY ? yx(item.center) : item.center;
        return  this.addTooltip(item, 
                    (L.circle(center, {
                        color: item.color || "red",
                        center : center,
                        radius : item.radius
                    })
        ));
    }

    makecircleMarker = (item, swapXY) => {
        const center = swapXY ? yx(item.center) : item.center;
        return  this.addTooltip(item, 
                    (L.circleMarker(center, {
                        color: item.color || "red",
                        center : center,
                        radius : item.radius || 4,
                    })
        ));
    }

    addImage = (imageData) => {
        const bounds = (imageData.bounds || []).map(xy => yx(xy));
        let newImageLayer = null;
        newImageLayer = L.imageWebGLOverlay(imageData.url, bounds, {
            ...imageData,
            minvalue: imageData.minvalue,
            maxvalue: imageData.maxvalue,
            colorScale: imageData.colorScale,
            shader: imageData.shader,
        });
        
        return newImageLayer;
    }

    addTile = (tileData) => {
        let newTileLayer = null;
        if(tileData.colorScale) {
            newTileLayer = L.tileWebGLLayer(tileData.url, {
                ...tileData,
                minvalue: tileData.minvalue,
                maxvalue: tileData.maxvalue,
                colorScale: tileData.colorScale,
                shader: tileData.shader,
            })
        } else {
            newTileLayer = L.tileLayer(tileData.url, {
                ...tileData,
            })
        }
        return newTileLayer;
    }

    // Assumes that coordinate data comes in on the format of (y,x) by default
    addItem(item, layerGroup, swapXY = true) {
        switch(item.type) {
            case "polyline":
                layerGroup.addLayer(this.makePolyline(item, swapXY));
                break;

            case "polygon":
                layerGroup.addLayer(this.makePolygon(item, swapXY));
                break;

            case "circle":
                layerGroup.addLayer(this.makeCircle(item, swapXY));
                break;
            
            case "circleMarker":
                layerGroup.addLayer(this.makecircleMarker(item, swapXY));
                break;
            
            case "marker":
                layerGroup.addLayer(this.makeMarker(item, swapXY));
                break;
                
            case "image":
                const imageLayer = this.addImage(item, swapXY);
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
                layerGroup.addLayer(this.addTile(item, swapXY));
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

    createMultipleLayers() {
        this.addScaleLayer(this.props.map);
        const layers = this.props.layers;
        for (const layer of layers) {
            this.createLayerGroup(layer);
        }
        this.addDrawLayerToMap();
        
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

    createLayerGroup = (layer) => {
        const layerGroup = L.featureGroup();

        // To make sure one does not lose data due to race conditions 
        this.setState(prevState => ({
            layers: Object.assign({}, prevState.layers, {[layer.id]: layerGroup})
        }));

        //adds object to a layer
        for (const item of layer.data) {
            this.addItem(item, layerGroup);
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
        
        for (const item of this.context.syncedDrawLayer.data) {
            if (this.props.syncedMaps.includes(item.creatorId)) {
                this.context.drawLayer.eachLayer(layer => {
                    try {
                        if(this.getShapeType(layer) === item.type) {
                            this.context.drawLayer.removeLayer(layer);
                        }
                    } catch (error) {}
                })
                this.addItem(item, this.context.drawLayer, false);
            }   
        }
    }

    // TODO: Move to utils
    getShapeType = layer => {
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
    
  
    render() {
        return (
            <div>
                <div>
                    {
                        (this.props.colorBar) &&
                        <ColorBar
                            map = {this.props.map}
                            position = {(this.props.colorBar || {}).position}
                            unit = {(this.props.colorBar || {}).unit}
                        />
                    }
                </div>
            </div>
        );
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