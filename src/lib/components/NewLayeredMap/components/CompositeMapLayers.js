import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Colormap from "./Colormap.react";

import L from 'leaflet';
import '../layers/L.imageWebGLOverlay';
import '../layers/L.tileWebGLLayer';
// \src\lib\components\NewLayeredMap\components\CompositeMapLayers.js
// import './layers/L.imageWebGLOverlay';
// import './layers/L.tileWebGLLayer';

const yx = ([x, y]) => {
    return [y, x];
};

const DEFAULT_ELEVATION_SCALE = 0.03;

class CompositeMapLayer extends Component {

    // renderTooltip(item) {
    //     if ("tooltip" in item) {
    //         item.bindTooltip(item.tooltip).addTo(map);

    //         return <Tooltip sticky={true}>{item.tooltip}</Tooltip>;
    //     }
    //     return null;
    // }

    addTooltip(item, shapeObject) {
        if ("tooltip" in item) {
            return shapeObject.bindTooltip(item.tooltip);
        }
        return shapeObject;
    }
    
    makePolyline = (item, pos) => {
        return this.addTooltip(item, 
                    (L.Polyline(pos, {
                        onClick: () => this.props.lineCoords(positions),
                        color: item.color,
                        positions: pos
                    })
        ));
    }

    makePolygon = (item, pos) => {
        return this.addTooltip(item, 
                    (L.Polygon(pos, {
                        onClick: () => this.props.polygonCoords(positions),
                        color: item.color,
                        positions: pos
                    })
        ));
    }

    makeCircle = (item) => {
        return  this.addTooltip(item, 
                    (L.Circle(pos, {
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
                const positions = item.positions.map(xy => yx(xy));
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

    createLayerGroup = () => {
        // console.log(this.props.map)
        const denver = L.marker([39.74, -104.99]).bindPopup('This is Denver, CO.'),
        const layerGroup = L.layerGroup([denver]);
        const layer = this.props.layer;

        console.log("props: ", this.props)
        console.log("layer group before: ", layerGroup.getLayers())
        console.log("polygon", layer[0][0]);
        console.log("polygon type: ", layer[0][0].type);
        console.log("circle", layer[0][1]);

        console.log("layers: ",  layer)

        for (let i = 0; i < layer[0].length; i++ ) {
            console.log("adding item: ", layer[0][i])
            this.addItem(layer[0][i], layerGroup);
        }
        

        /* layer.forEach((item) => {
        }) */
        console.log("layer group after: ", layerGroup.getLayers())
        layerGroup.setZIndex(1000);
        layerGroup.addTo(this.props.map);
    }
  


 
    render() {
        this.createLayerGroup();
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
