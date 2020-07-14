import React, {Component} from "react";
import PropTypes from "prop-types";

import L from 'leaflet';
import '../layers/L.imageWebGLOverlay';
import '../layers/L.tileWebGLLayer';
import Colorbar from './Colorbar'
import Context from '../Context'


const yx = ([x, y]) => {
    return [y, x];
};
const DEFAULT_BOUNDS = [[0, 0], [30, 30]];

const DEFAULT_ELEVATION_SCALE = 0.03;

class CompositeMapLayers extends Component {

    // TODO: should this actually be here?
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
        const newState = {
            colorMap: newLayer.data[0].colorMap,
            colorScale: newLayer.data[0].colorScale,
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
        if (prevProps.layers !== this.props.layers) {
            const layers = (this.props.layers || []).filter(layer = layer.id);
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
                        color: item.color || "blue",
                        positions: pos
                    })
        ));
    }

    makePolygon = (item) => {
        const pos = item.positions.map(xy => yx(xy));
        return this.addTooltip(item, 
                    (L.polygon(pos, {
                        onClick: () => this.props.polygonCoords(positions),
                        color: item.color || "blue",
                        positions: pos
                    })
        ));
    }

    makeMarker = (item) => {
        const pos = yx(item.position);
        return  this.addTooltip(item, 
                    L.marker(pos)
        );
    }

    makeCircle = (item) => {
        return  this.addTooltip(item, 
                    (L.circle(yx(item.center), {
                        color: item.color || "red",
                        center : yx(item.center),
                        radius : item.radius
                    })
        ));
    }

    /**
     * Calculates cutOffPoints based on given a min/max values and min/max-cutoff-points between 0 and 255.a
     * @example
     * getColorCutOffPoints(0, 1000, 500, 1000) // { 127, 255 } 
     */
    getColorCutOffPoints(min, max, cutMin, cutMax) {
        if (cutMax > max) {
            cutMax = max;
        }
        if (cutMin < min) {
            cutMin = min;
        }

        const maxColorValue = Math.round(255 - (Math.abs((cutMax - max)) / (max - min)) * 255) /// clear colors below this
        const minColorValue = Math.round(255 - ((cutMin - min) / (max - min)) * 255)

        return {
            cutPointMin: minColorValue,
            cutPointMax: maxColorValue,
        };

    }

    updateStateForColorbar = (newState) => {
        const oldState = {
            colorMap: this.state.colorMap,
            colorScale: this.state.colorScale,
            minvalue: this.state.minvalue,
            maxvalue: this.state.maxvalue
        }
        if (oldState != newState) {
            this.setState(newState);
        }

    }
    
    addImage = (imageData) => {
        const newColorBarState = {
            colorMap: imageData.colorMap,
            colorScale: imageData.colorScale,
            minvalue: imageData.minvalue,
            maxvalue: imageData.maxvalue
        };
        this.updateStateForColorbar(newColorBarState); 

        const cutOffPoints = this.getColorCutOffPoints(
            imageData.minvalue,
            imageData.maxvalue,
            (imageData.colorScale || {}).cutPointMin,
            (imageData.colorScale || {}).cutPointMax,
        );

        const bounds = imageData.bounds.map(xy => yx(xy));
        let newImageLayer = null;
        if (imageData.colorScale || imageData.colorMap){
            newImageLayer = L.imageWebGLOverlay(imageData.url, bounds, {
                ...imageData,
                colorScale: imageData.colorScale || imageData.colorMap,
                shader: imageData.shader,
                ...cutOffPoints,
            });
        } else {
            newImageLayer = L.imageOverlay(imageData.url, bounds, {
                ...imageData,
            })
        }
        return newImageLayer;
    }

    addTile = (tileData) => {
        const newColorBarState = {
            colorMap: tileData.colorMap,
            colorScale: tileData.colorScale,
            minvalue: tileData.minvalue,
            maxvalue: tileData.maxvalue
        };
        this.updateStateForColorbar(newColorBarState); 

        const cutOffPoints = this.getColorCutOffPoints(
            tileData.minvalue,
            tileData.maxvalue,
            (tileData.colorScale || {}).cutPointMin,
            (tileData.colorScale || {}).cutPointMax,
        );

        let newTileLayer = null;
        if(tileData.colorScale || tileData.colorMap) {
            newTileLayer = L.tileWebGLLayer(tileData.url, {
                ...tileData.colorMap,
                colorScale: tileData.colorScale || tileData.colorMap,
                shader: tileData.shader,
                ...cutOffPoints,
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
            
            case "marker":
                layerGroup.addLayer(this.makeMarker(item));
                break;
                
            case "image":
                const imageLayer = this.addImage(item);
                layerGroup.addLayer(imageLayer);
                imageLayer.onLayerChanged((imgLayer) => {
                    this.setFocusedImageLayer(imgLayer.getUrl(), imgLayer.getCanvas(), imgLayer.options.minvalue, imgLayer.options.maxvalue);
                });
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

    // TODO: generalize for drawlayer
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

    addDrawLayerToMap = () => {
        this.setState(prevState => ({
            layers: Object.assign({}, prevState.layers, {drawLayer: this.context.drawLayer})
        }));

        this.context.drawLayer.addTo(this.props.map);

        this.state.layerControl.addOverlay(this.context.drawLayer, "Drawings");
    }

    updateDrawLayer = (newLayerData) => {
        this.state.drawLayer.clearLayers();
        for (const item of newLayerData) {
            this.addItem(item, this.state.drawLayer);
        }
    }

    setFocusedImageLayer = (url, onScreenCanvas, minvalue, maxvalue) => {
        const updateFunc = this.context.setFocusedImageLayer;
        if(updateFunc) {
            updateFunc(url, onScreenCanvas, minvalue, maxvalue);
        }
    }

    render() {
        return (
            <div>
                <div>
                    <Colorbar
                        colorScale = {this.state.colorScale}
                        colorMap = {this.state.colorMap}
                        minvalue = {this.state.minvalue}
                        maxvalue = {this.state.maxvalue}
                        map = {this.props.map}
                        unit = {"m"}
                    />
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

// export const DrawLayerContext = React.createContext("hi");

export default CompositeMapLayers;