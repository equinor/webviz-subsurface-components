import React, {Component} from "react";
import PropTypes from "prop-types";

import L from 'leaflet';
import '../layers/L.imageWebGLOverlay';
import '../layers/L.tileWebGLLayer';
import Colorbar from './Colorbar'
import { buildColormapFromHexColors, DEFAULT_COLORSCALE_CONFIG } from '../colorscale';

const yx = ([x, y]) => {
    return [y, x];
};
const DEFAULT_BOUNDS = [[0, 0], [30, 30]];

const DEFAULT_ELEVATION_SCALE = 0.03;

class CompositeMapLayers extends Component {

    constructor(props) {
        super(props);

        this.state = {
            layers: {
                    
            },
        }
    }

    componentDidMount() {
        const layerControl = L.control.layers([]).addTo(this.props.map);
        
        this.setState({layerControl: layerControl}, () => this.createMultipleLayers())
        
    }

    // TODO: fix for overlay stuff as well
    updateLayer = (curLayer, newLayer) => {
        const newState = {colormap: newLayer.data[0].colormap,
            colorscale: newLayer.data[0].colorScale,
            minvalue: newLayer.data[0].minvalue,
            maxvalue: newLayer.data[0].maxvalue
            };
        this.updateStateForColorbar(newState); 
        
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

            case "polyline":
                break;

            case "polygon":
                break;

            case "circle":
                break;
 
        }
    }

    //TODO: make update work
    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            const layers = this.props.layers;
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
        // TODO: Add, delete or update layers based on this.props.layers.
        // TODO: alle layers må ha id, filtrer vekk de som ikke har det i newLayeredMap
        // legg på action (add, update eller delete)
        // add by default

    componentWillUnmount() {
        // TODO: Remove all layers from the map
        const map = this.props.map
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });
        this.state.layers = undefined; // ?
    }

    addTooltip = (item, shapeObject) => {
        if ("tooltip" in item) {
            return shapeObject.bindTooltip(item.tooltip);
        }
        return shapeObject;
    }

    makePolyline = (item) => {
        const pos = item.positions.map(xy => yx(xy));
        return this.addTooltip(item, 
                    (L.polyline(pos, {
                        onClick: () => this.props.lineCoords(positions),
                        color: item.color,
                        positions: pos
                    })
        ));
    }

    makePolygon = (item) => {
        const pos = item.positions.map(xy => yx(xy));
        return this.addTooltip(item, 
                    (L.polygon(pos, {
                        onClick: () => this.props.polygonCoords(positions),
                        color: item.color,
                        positions: pos
                    })
        ));
    }

    makeCircle = (item) => {
        return  this.addTooltip(item, 
                    (L.circle(yx(item.center), {
                        color: item.color,
                        center : yx(item.center),
                        radius : item.radius
                    })
        ));
    }

    getColorCutOffPoints(min, max, cutMin, cutMax) {
        if (cutMax > max)
            cutMax = max;
        if (cutMin < min)
            cutMin = min;

        const maxColorValue = Math.round(255 - (Math.abs((cutMax - max)) / (max - min)) * 255) /// clear colors below this
        const minColorValue = Math.round(255 - ((cutMin - min) / (max - min)) * 255)

        return [maxColorValue, minColorValue];

    }

    updateStateForColorbar = (newState) => {
        const oldState = {colormap: this.state.colormap,
                          colorscale: this.state.colorScale,
                          minvalue: this.state.minvalue,
                          maxvalue: this.state.maxvalue
                          }
        if (oldState != newState) {
            this.setState(newState, );
        }

    }
    addImage = (imageData) => {
        const newState = {colormap: imageData.colormap,
                          colorscale: imageData.colorScale,
                          minvalue: imageData.minvalue,
                          maxvalue: imageData.maxvalue
                          };
        this.updateStateForColorbar(newState); 

        imageData.cutoffPoints = this.getColorCutOffPoints(
                                            imageData.minvalue,
                                            imageData.maxvalue,
                                            imageData.colorScale.cutPointMin,
                                            imageData.colorScale.cutPointMax,
                                            );
        imageData.cutoffMethod = imageData.colorScale.cutoffMethod;
        const bounds = imageData.bounds.map(xy => yx(xy));
        let newImageLayer = null;
        if (imageData.colorScale || imageData.colormap){
            newImageLayer = L.imageWebGLOverlay(imageData.url, bounds, {
                ...imageData,
                colorScale: imageData.colorScale || imageData.colormap,
                shader: imageData.shader,
                cutoffPoints: imageData.cutoffPoints,
            });
        } else {
            newImageLayer = L.imageOverlay(imageData.url, bounds, {
                ...imageData,
            })
        }
        return newImageLayer;
    }

    addTile = (tileData) => {
        const newState = {colormap: tileData.colormap,
                          colorscale: tileData.colorScale,
                          minvalue: tileData.minvalue,
                          maxvalue: tileData.maxvalue
                          };
        this.updateStateForColorbar(newState); 

        tileData.cutoffPoints = this.getColorCutOffPoints(
                                        tileData.minvalue,
                                        tileData.maxvalue,
                                        tileData.colorScale.cutPointMin,
                                        tileData.colorScale.cutPointMax,
                                    );
        let newTileLayer = null;
        if(tileData.colorScale || tileData.colormap) {
            newTileLayer = L.tileWebGLLayer(tileData.url, {
                ...tileData.colormap,
                colorScale: tileData.colorScale || tileData.colormap,
                shader: tileData.shader,
                cutOffPoints: tileData.cutoffPoints,
            })
        } else {
            newTileLayer = L.tileLayer(tileData.url, {
                ...tileData,
            })
        }
        return newTileLayer;
    }

    addItem(item, layerGroup) {

        switch(item.type) {
            case "polyline":
                layerGroup.addLayer(this.makePolyline(item));
                break;

            case "polygon":
                layerGroup.addLayer(this.makePolygon(item));
                break;

            case "circle":
                layerGroup.addLayer(this.makeCircle(item));
                break;
                
            case "image":
                layerGroup.addLayer(this.addImage(item));
                break;

            case "tile": 
                layerGroup.addLayer(this.addTile(item));
                break;

            default:
                break; // add error message here?
          }
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
        const layerGroup = L.layerGroup();

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
            const bounds = layer.data[0].bounds ? layer.data[0].bounds.map(xy => yx(xy)) : DEFAULT_BOUNDS;
            this.props.map.fitBounds(bounds);
        } else {
            this.state.layerControl.addOverlay(layerGroup, layer.name);
        }
    }

  
    render() {
        return (<Colorbar
                colorscale = {this.state.colorscale}
                colormap = {this.state.colormap}
                minvalue = {this.state.minvalue}
                maxvalue = {this.state.maxvalue}
                map = {this.props.map}
                unit = {"m"}
        />);
    }
}

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