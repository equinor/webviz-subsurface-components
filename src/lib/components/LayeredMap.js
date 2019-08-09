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

import ImageOverlayWebGL from '../private_components/layered-map-resources/ImageOverlayWebGL'

class LayeredMap extends Component {

    constructor(props) {
        super(props);
        this.elementId = `container-${props.id}`;
        [[this.xmin, this.ymin], [this.xmax, this.ymax]] = props.map_bounds
        this.physical2pixels = 0.5*LayeredMap.defaultProps.height/(this.ymax - this.ymin)

        this.base_layers = props.base_layers;
        this.overlay_layers = props.overlay_layers;

        this.yx = (xy) => {
            const [x, y] = xy
            const yscaled = (y - this.ymin)*this.physical2pixels
            const xscaled = (x - this.xmin)*this.physical2pixels
            return [yscaled, xscaled]
        }

    }

    render_polyline(polyline, key) {
        if ('tooltip' in polyline){
            return (<Polyline color={polyline.color} positions={polyline.positions.map(xy => this.yx(xy))} key={key}>
                        <Tooltip>{polyline.tooltip}</Tooltip>
                    </Polyline>)
        } else {
            return <Polyline color={polyline.color} positions={polyline.positions.map(xy => this.yx(xy))} key={key} />
        }
    }

    render_polygon(polygon, key) {
        if ('tooltip' in polygon){
            return (<Polygon color={polygon.color} positions={polygon.positions.map(xy => this.yx(xy))} key={key}>
                        <Tooltip>{polygon.tooltip}</Tooltip>
                    </Polygon>)
        } else {
            return <Polygon color={polygon.color} positions={polygon.positions.map(xy => this.yx(xy))} key={key} />
        }
    }

    render_circle(circle, key) {
        if ('tooltip' in circle){
            return (<Circle color={circle.color} center={this.yx(circle.center)} radius={circle.radius} key={key}>
                       <Tooltip>{circle.tooltip}</Tooltip>
                    </Circle>)
        } else {
            return <Circle color={circle.color} center={this.yx(circle.center)} radius={circle.radius} key={key} />
        }
    }

    render_image(image, key) {
        return <ImageOverlayWebGL url={image.url} colormap={image.colormap} bounds={image.bounds.map(xy => this.yx(xy))} key={key} />
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
                <Map style={{height: LayeredMap.defaultProps.height}}
                     center={this.yx(this.props.center)} 
                     zoom={1}
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

LayeredMap.defaultProps = {
    height: 500,
};

LayeredMap.propTypes = {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string.isRequired,

    /**
     * Center [x, y] of map when initially loaded (in physical coordinates).
     */
    center: PropTypes.array,

    /**
     * The map bounds of the input data, given as [[xmin, ymin], [xmax, ymax]] (in physical coordinates).
     */
    map_bounds: PropTypes.array,

    /**
     * An array of different base layers. Each base layer is a dictionary with the following structure:
     *    {
           'name': 'Name of my layer',  // Name of the layer (appears in the map layer control)
           'checked': False, // If it should be checked initially (only one base layer can have this as True)
           'data': [ ... ] // A list of the different map components this layer consists of (see below for the allowed components)
          }
     */
    base_layers: PropTypes.array,

    /**
     * An array of different overlay layers. The syntax of an overlay layer follows exactly that of base layers,
     * with the only exception that 'checked' can be True for an arbitrary number of overlay layers simultaneously.
     */
    overlay_layers: PropTypes.array
};

export default LayeredMap;

/** Allowed map components:
*
* Polyline is a sequence of line segments:
*
*     {
*      'type': 'polyline',
*      'positions': [[x1, y1],
*                    [x2, y2],
*                    [x3, y3]],
*      'color': 'green',
*      'tooltip': 'This is a green fault line' // This one is optional.
*     }
*
* Polygon is a sequence of line segmens which in addition is filled. Same
* syntax as for polyline except 'type' is 'polygon'.
*
* A circle annotation:
*
*     {
*      'type': 'circle',
*      'center': [x1, y1],
*      'color': 'red',
*      'radius': 2,
*      'tooltip': 'This is a red circle' // This one is optional.
*     }
*
* An overlay image:
*
*     {
*      'type': 'image',
*      'url': either base64 encoding of the picture or a path to hosted image,
*      'bounds': [[xmin, ymin],  // The extent of the picture in the rendered map
*                 [xmax, ymax]]
*     }
*/
