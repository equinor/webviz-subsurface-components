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

        this.state = {
            layers: {
                    
            },
        }
    }

    componentDidMount() {
        const layerControl = L.control.layers([]).addTo(this.props.map);
        
        this.setState({layerControl: layerControl}, () => this.createMultipleLayers())
        
    }

    printLayerNames = () =>  {
        this.props.map.eachLayer(function(layer) {
            console.log(layer.name + "\n")
        });
    }

    updateLayer = (curLayer, newLayer) => {
        console.log("got to updateLayer()");
        switch(newLayer.data[0].type) {
            case 'image':
                break;

            case 'tile':
                console.log("case: tile")
                console.log("NewLayer", newLayer.data[0].colormap)
                curLayer.getLayers()[0].update(newLayer.data[0].colormap, {
                    ...newLayer.colormap,
                    shader: newLayer.shader,
                });
                console.log("properties after: ", curLayer)
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
        // console.log("props: ", this.props.layer[1]);
        // console.log("prevproperties: ",  prevProps.layer[1]);
        if (prevProps != this.props) {
            const layers = this.props.layer;

            for (const propLayer of layers) {
                switch(propLayer.action) {
                    case "update":
                        console.log("\nlayer before update: ", propLayer)
                        const stateLayer = this.state.layers[propLayer.id]
                        if (stateLayer) {
                            this.updateLayer(stateLayer, propLayer);
                            // stateLayer.remove();
                            // this.state.layerControl.removeLayer(stateLayer);
                            // this.createLayerGroup(propLayer);
                        }
                        console.log("\nlayer after update: ", propLayer)

                        break;

                    case "delete":
                        console.log("case: delete, layer: ", propLayer.name)
                        if (this.state.layers[propLayer.id]) {
                            // state layer is the layer object that's active on the map
                            // propLayer is the layer object from props
                            const stateLayer = this.state.layers[propLayer.id];
                            stateLayer.remove();
                            this.state.layerControl.removeLayer(stateLayer);
                            this.removeLayerFromState(propLayer.id);
                        }
                        break;
                    case "add":
                            if (!this.state.layers[propLayer.id]) {
                                this.createLayerGroup(propLayer);
                                console.log("added layer:", propLayer)
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
        console.log("CWU triggered in CML")
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
        const layers = this.props.layer;
        for (const layer of layers) {
            this.createLayerGroup(layer);
        }
        
    }
 
    removeLayerFromState = (id) => {
        console.log("layers in state before delete: ", )
        this.setState(prevState => {
           const newLayers = Object.assign({}, prevState.layers);
           delete newLayers[id];
           return {
               layers: newLayers
           };
        }, () => console.log("layers in state after delete: ", this.state.layers));
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
