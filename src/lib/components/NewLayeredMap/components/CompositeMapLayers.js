import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import ImageOverlayWebGL from "./ImageOverlayWebGL.react";
import Colormap from "./Colormap.react";

import { Circle, LayerGroup, Polygon, Polyline, Tooltip } from "react-leaflet";

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
    
    makePolyline = (item, pos) => {
        return  L.Polyline(coordinates, {
            onClick: () => this.props.lineCoords(positions),
            color: item.color,
            positions: pos
        });
    }

    makePolygon = (item, pos) => {
        return  L.Polyline(coordinates, {
            onClick: () => this.props.polygonCoords(positions),
            color: item.color,
            positions: pos
        });
    }

    makeCircle = (item) => {
        return  L.Polyline(coordinates, {
            color: item.color,
            center : yx(item.center),
            radius : item.radius
        });
    }




    addItem(item) {
        switch(item.type) {
            case "polyline":
                const positions = item.positions.map(xy => yx(xy));
                return this.makePolyline(item, positions);

            case "polygon":
                const positions = item.positions.map(xy => yx(xy));
                return this.makePolygon(item, positions);

            case "circle":
                return this.makeCircle(item);

            default:
                break;
          }
        

    }

    createLayerGroup = () => {
        const layerObjects = {}
        const layer = this.props.layer

        layer.data.forEach.forEach((item) => {

        })
    }
    addLayerGroup = (layer) => {
        L.layerGroup(group_name).addTo(this.props.map);

        
    }
    createLayer() {
        const layerInfo = this.props.layer;

        
    }

    renderItem(item, index) {
        if (item.type === "polyline") {
            const positions = item.positions.map(xy => yx(xy));
            this.makePolyline(item)
            return (
                <Polyline
                    onClick={() => this.props.lineCoords(positions)}
                    color={item.color}
                    positions={positions}
                    key={index}
                >
                    {this.renderTooltip(item)}
                </Polyline>
            );
        }
        if (item.type === "polygon") {
            const positions = item.positions.map(xy => yx(xy));
            return (
                <Polygon
                    onClick={() => this.props.polygonCoords(positions)}
                    color={item.color}
                    positions={positions}
                    key={index}
                >
                    {this.renderTooltip(item)}
                </Polygon>
            );
        }
        if (item.type === "circle") {
            return (
                <Circle
                    color={item.color}
                    center={yx(item.center)}
                    radius={item.radius}
                    key={index}
                >
                    {this.renderTooltip(item)}
                </Circle>
            );
        }
        if (item.type === "image") {
            return (
                <>
                    <ImageOverlayWebGL
                        url={item.url}
                        colormap={item.colormap}
                        bounds={item.bounds.map(xy => yx(xy))}
                        hillShading={
                            this.props.hillShading && item.allowHillshading
                        }
                        elevationScale={
                            item.elevationScale || DEFAULT_ELEVATION_SCALE
                        }
                        lightDirection={this.props.lightDirection}
                        minvalue={item.minvalue}
                        maxvalue={item.maxvalue}
                        unit={item.unit}
                        key={index}
                    />
                    {"colormap" in item && (
                        <Colormap
                            colormap={item.colormap}
                            unit={item.unit}
                            minvalue={item.minvalue}
                            maxvalue={item.maxvalue}
                            position="bottomleft"
                            key={"colormap" + index}
                        />
                    )}
                </>
            );
        }
        return null;
    }

    // goes through objects in layers, add them each to a map, makes map a layer group


 
    render() {
        return (
            <LayerGroup>
                {this.props.layer.data.map((item, index) => {
                    return (
                        <Fragment key={index}>
                            {this.renderItem(item, index)}
                        </Fragment>
                    );
                })}
            </LayerGroup>
        );
    }
}

CompositeMapLayer.propTypes = {
    map: PropTypes.object.isRequired,

    /* Data for one single layer. See parent component LayeredMap for documentation.
     */
    layer: PropTypes.object,

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
