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

class CompositeMapLayer extends Component {

    constructor(props) {
        super(props);

        // TODO: Add all layers by id in state
        this.state = {
            layers: {

            }
        }
    }

    componentDidMount() {
        this.createMultipleLayers();
    }

    componentDidUpdate(prevProps) {
        // TODO: Add, delete or update layers based on this.props.layers.
    }

    componentWillUnmount() {
        // TODO: Remove all layers from the map
    }

    addTooltip(item, shapeObject) {
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
    addImage = (image, layerGroup) => {
        const bounds = image.bounds.map(xy => yx(xy));
        if ("colormap" in image){
            layerGroup.addLayer(L.imageWebGLOverlay(image.url, bounds, image.colormap, {
                shader: image.shader
            }));
        } else {
            layerGroup.addLayer(L.imageOverlay(image.url, bounds))
        }
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
                this.addImage(item, layerGroup);
                break;

            default:
                break; // add error message here?
          }
    }
    createMultipleLayers() {
        const layerControl = L.control.layers([]).addTo(this.props.map);

        const layers = this.props.layer;
        for (let i = 0; i < layers.length; i++) {
            this.createLayerGroup(layers[i], layerControl);
        }
        
    }

    createLayerGroup = (layer, layerControl) => {
        const layerGroup = L.layerGroup();

        //adds object to a layer
        for (let i = 0; i < layer.data.length; i++ ) {
            this.addItem(layer.data[i], layerGroup);
        }

        if(layer.checked) {
            layerGroup.addTo(this.props.map);
        }

        // adds layers to the layerControl
        if(layer.base_layer) {
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

CompositeMapLayer.propTypes = {
    map: PropTypes.object.isRequired,

    /* Data for one single layer. See parent component LayeredMap for documentation.
     */
    layer: PropTypes.array,

    /* Add hillshading to an image layer*/
    hillShading: PropTypes.bool,

    /* Coordinates for selected polyline*/
    lineCoords: PropTypes.func,

    /* Vector specifiyng the light direction*/
    lightDirection: PropTypes.array,

    /* Coordinates for selected polygon*/
    polygonCoords: PropTypes.func,
};

export default CompositeMapLayer;
