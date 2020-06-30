import React, {Component} from "react";
import PropTypes from "prop-types";

import L from 'leaflet';
import '../layers/L.imageWebGLOverlay';
import '../layers/L.tileWebGLLayer';

const yx = ([x, y]) => {
    return [y, x];
};
const DEFAULT_BOUNDS = [[0, 0], [30, 30]];

const DEFAULT_ELEVATION_SCALE = 0.03;

class CompositeMapLayers extends Component {

    constructor(props) {
        super(props);

        // TODO: Add all layers by id in state
        this.state = {
            layers: {
                    
            },
        }
    }

    componentDidMount() {
        this.createMultipleLayers();
    }

    /* componentDidUpdate(prevProps) {
        const layers = this.props.layer;
        for (const layer in layers) {
            switch(layer.action) {
                case "update":
                    if (this.state.layers[layer.id]) {
                        this.props.map.removeLayer(layer);
                        this.createLayerGroup(layer, this.state.layerControl);
                    }
                    break;

                case "delete":
                    if (this.state.layers[layer.id]) {
                        this.props.map.removeLayer(layer);
                        this.setState({[layer.id]: undefined});
                        
                    }
                    break;
                default:
                    // add
                    if (!this.state.layers[layer.id]) {
                        this.createLayerGroup(layer, this.state.layerControl);
                    } 
                    break;
            }
    } */
        // TODO: Add, delete or update layers based on this.props.layers.
        // TODO: alle layers må ha id, filtrer vekk de som ikke har det i newLayeredMap
        // legg på action (add, update eller delete)
        // add by default
    // }

    // componentWillUnmount() {
    //     // TODO: Remove all layers from the map
    //     this.props.map.eachLayer(function (layer) {
    //         this.props.map.removeLayer(layer);
    //     });
    // }

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
    // add default bounds?
    addImage = (imageData) => {
        const bounds = imageData.bounds.map(xy => yx(xy));
        let newImageLayer = null;
        if ("colormap" in imageData){
            newImageLayer = L.imageWebGLOverlay(imageData.url, bounds, imageData.colormap, {
                ...imageData,
                shader: imageData.shader
            });
        } else {
            newImageLayer = L.imageOverlay(imageData.url, bounds, {
                ...imageData,
            })
        }
        return newImageLayer;
    }

    addTile = (tileData) => {
        let newTileLayer = null;
        if("colormap" in tileData) {
            newTileLayer = L.tileWebGLLayer(tileData.url, tileData.colormap, {
                ...tileData.colormap,
                shader: tileData.shader,
            })
        } else {
            newTileLayer = L.tileLayer(tileData.url, {
                ...tileData,
            })
        }
        return newTileLayer;
    }


    addItem(item, layerGroup) {
        // console.log(item);

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
        const layerControl = L.control.layers([]).addTo(this.props.map);
        this.setState({layerControl: layerControl});

        const layers = this.props.layer;
        for (let i = 0; i < layers.length; i++) {
            this.createLayerGroup(layers[i], layerControl);
        }
        
    }

  
    createLayerGroup = (layer, layerControl) => {
        const layerGroup = L.layerGroup();
        const layerToState = Object.assign({}, this.state.layers);
        layerToState[layer.id] = layer;
        console.log("Layer ID: ", layer.id, " Layer name: ", layer.name)
        console.log("layertostate: ", layerToState);
        
        
        // To make sure one does not lose data due to race conditions 
        this.setState(prevState => ({
            layers: Object.assign({}, prevState.layers, {[layer.id]: layerGroup})
        }), () => console.log("NewState:", this.state.layers))
        
        //adds object to a layer
        for (let i = 0; i < layer.data.length; i++ ) {
            this.addItem(layer.data[i], layerGroup);
        }

        if(layer.checked) {
            layerGroup.addTo(this.props.map);
        }

        // adds layers to the layerControl
        if(layer.baseLayer) {
            layerControl.addBaseLayer(layerGroup, layer.name);

            // Fits the map bounds if layer is a base layer
            // TODO: improve bounds optimization?
            const bounds = layer.data[0].bounds ? layer.data[0].bounds.map(xy => yx(xy)) : DEFAULT_BOUNDS;
            this.props.map.fitBounds(bounds);
        } else {
            layerControl.addOverlay(layerGroup, layer.name);
        }

    }
  
 
    render() {
        return (null);
    }
}

CompositeMapLayers.propTypes = {
    map: PropTypes.object.isRequired,

    /* Data for one single layer. See parent component LayeredMap for documentation.
     */
    layer: PropTypes.array,

    /* Coordinates for selected polyline*/
    lineCoords: PropTypes.func,

    /* Coordinates for selected polygon*/
    polygonCoords: PropTypes.func,

};

export default CompositeMapLayers;
