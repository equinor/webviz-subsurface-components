import React, {Component} from "react";
import PropTypes from "prop-types";

import L from 'leaflet';
import '../layers/L.imageWebGLOverlay';
import '../layers/L.tileWebGLLayer';

const yx = ([x, y]) => {
    return [y, x];
};

const DEFAULT_ELEVATION_SCALE = 0.03;

class CompositeMapLayer extends Component {


    addTooltip(item, shapeObject) {
        if ("tooltip" in item) {
            console.log("shape inside addtooltip", shapeObject)
            return shapeObject.bindTooltip(item.tooltip);
        }
        return shapeObject;
    }
    
    makePolyline = (item, pos) => {
        return this.addTooltip(item, 
                    (L.polyline(pos, {
                        onClick: () => this.props.lineCoords(positions),
                        color: item.color,
                        positions: pos
                    })
        ));
    }

    makePolygon = (item, pos) => {
        return this.addTooltip(item, 
                    (L.polygon(pos, {
                        onClick: () => this.props.polygonCoords(positions),
                        color: item.color,
                        positions: pos
                    })
        )).addTo(this.props.map);
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
        if ("colormap" in image){
            layerGroup.addLayer(L.imageWebGLOverlay(image.url, image.bounds, {
                colormap: image.colormap
            }));
        } else {
            layerGroup.addLayer(L.imageOverlay(image.url, image.bounds))
        }
    }


    //pass in layer.data
    addItem(item, layerGroup) {
        switch(item.type) {
            case "polyline":
                const positions = item.positions.map(xy => yx(xy));
                layerGroup.addLayer(this.makePolyline(item, positions));
                break;

            case "polygon":
                console.log("positions before: ", item.positions)
                const positions = item.positions.map(xy => yx(xy));
                console.log("positions after: ", positions)
                layerGroup.addLayer(this.makePolygon(item, positions));
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
        L.control.layers([]).addTo(this.props.map);


        const layers = this.props.layer;
        for (let i = 0; i < layers.length; i++) {
            this.createLayerGroup(layers);
        }
        
    }

    createLayerGroup = (layer) => {
        const layerGroup = L.layerGroup([]);


        for (let i = 0; i < layer.data.length; i++ ) {
            console.log("adding item: ", layer[0][i])
            this.addItem(layer[0][i], layerGroup);
        }

        if(layer.base_layer) 
        const layer_name = layer.name;
        baseMaps[layer.name] = layerGroup
             


        /* layer.forEach((item) => {
        }) */
        layerGroup.addTo(this.props.map);
    }
  


 
    render() {
        this.createMultipleLayers();
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
