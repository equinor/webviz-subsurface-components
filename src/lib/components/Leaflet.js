import React, {Component} from 'react';
import PropTypes from 'prop-types';

import 'leaflet/dist/leaflet.css';
import {CRS} from 'leaflet';

import {
  Circle,
  ImageOverlay,
  LayersControl,
  LayerGroup,
  Map,
  Polygon,
  Polyline,
  Tooltip
} from 'react-leaflet'

const { BaseLayer, Overlay } = LayersControl

import ImageOverlayWebGL from '../private_components/leaflet-resources/ImageOverlayWebGL'

class Leaflet extends Component {


    constructor(props) {
        super(props);
        this.elementId = `container-${props.id}`;
        this.map_bounds = props.map_bounds;
        this.base_layers = props.base_layers;
        this.overlay_layers = props.overlay_layers;
    }

    render_polyline(polyline, key) {
        if ('tooltip' in polyline){
            return (<Polyline color={polyline.color} positions={polyline.positions} key={key}>
                        <Tooltip>{polyline.tooltip}</Tooltip>
                    </Polyline>)
        } else {
            return <Polyline color={polyline.color} positions={polyline.positions} key={key} />
        }
    }

    render_polygon(polygon, key) {
        if ('tooltip' in polygon){
            return (<Polygon color={polygon.color} positions={polygon.positions} key={key}>
                        <Tooltip>{polygon.tooltip}</Tooltip>
                    </Polygon>)
        } else {
            return <Polygon color={polygon.color} positions={polygon.positions} key={key} />
        }
    }

    render_circle(circle, key) {
        if ('tooltip' in circle){
            return (<Circle color={circle.color} center={circle.center} radius={circle.radius} key={key}>
                       <Tooltip>{circle.tooltip}</Tooltip>
                    </Circle>)
        } else {
            return <Circle color={circle.color} center={circle.center} radius={circle.radius} key={key} />
        }
    }

    render_image(image, key) {
        if ('colormap' in image){
            return <ImageOverlayWebGL url={image.url} colormap={image.colormap} bounds={image.bounds} key={key} />
        } else {
            return <ImageOverlayWebGL url={image.url} bounds={image.bounds} key={key} />    
        }
    }

    render_layer_items(layer){
        return layer.data.map((item, index) => {
            if (item.type == 'polyline'){
                return this.render_polyline(item, index)
            } else if (item.type == 'polygon'){
                return this.render_polygon(item, index)    
            } else if (item.type == 'circle'){
                return this.render_circle(item, index)    
            } else if (item.type == 'image'){
                return this.render_image(item, index)    
            }
        })
    }

    
    render() {
        return (
            <div id={this.elementId} >
                <Map style={{height: Leaflet.defaultProps.height}}
                     bounds={this.map_bounds}
                     attributionControl={false}
                     crs={CRS.Simple}>
                    <LayersControl position="topright">
                        {this.base_layers.map((layer, index) => (
                            <BaseLayer checked={layer.checked} name={layer.name} key={index}>
                                <LayerGroup>
                                    {this.render_layer_items(layer)}
                                </LayerGroup>
                            </BaseLayer>
                        ))}
                        {this.overlay_layers.map((layer, index) => (
                            <Overlay checked={layer.checked} name={layer.name} key={index}>
                                <LayerGroup>
                                    {this.render_layer_items(layer)}
                                </LayerGroup>
                            </Overlay>
                        ))}
                    </LayersControl>
                </Map>
            </div>
        );
    }
}

Leaflet.defaultProps = {
    height: 500,
};

Leaflet.propTypes = {
    id: PropTypes.string.isRequired,
    map_bounds: PropTypes.array,
    base_layers: PropTypes.array,
    overlay_layers: PropTypes.array
};

export default Leaflet;
