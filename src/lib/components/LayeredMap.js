/* eslint no-inline-comments: 0 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'leaflet/dist/leaflet.css';
import {CRS} from 'leaflet';
import { LayersControl, Map, ScaleControl, FeatureGroup } from 'react-leaflet'
import Switch from '../private_components/layered-map-resources/Switch.react'
import CompositeMapLayer from '../private_components/layered-map-resources/CompositeMapLayer.react'
import DrawControls from '../private_components/layered-map-resources/DrawControls.react'
import VerticalZoom from '../private_components/layered-map-resources/VerticalZoom.react'
import '../private_components/layered-map-resources/layered-map.css'

const { BaseLayer, Overlay } = LayersControl
const yx = ([x,y]) => {return [y, x]}

class LayeredMap extends Component {

    constructor(props) {
        super(props)
        this.mapRef = React.createRef()
        this.state = {hillShading: this.props.hillShading}
    }

    handleHillshadingChange(){
        this.setState({hillShading: !this.state.hillShading})
    }

    render() {
        const {draw_toolbar_marker, draw_toolbar_polygon, draw_toolbar_polyline, setProps} = this.props
        const showDrawControls = (draw_toolbar_marker || draw_toolbar_polygon || draw_toolbar_polyline) ? true : false
        const showHillshadingSwitch = this.props.layers.some(layer => layer.data.some(item => item.allowHillshading))

        return (
                <Map id={this.props.id} style={{height: this.props.height}}
                     ref={this.mapRef}
                     center={yx(this.props.center)}
                     zoom={-3}
                     minZoom={-5}
                     attributionControl={false}

                     crs={CRS.Simple}>
                    { this.props.showScaleY &&
                        <VerticalZoom position='topleft' scaleY={this.props.scaleY} minScaleY={1} maxScaleY={10} />
                    }
                    <ScaleControl position='bottomright' imperial={false} metric={true} />
                    <LayersControl position='topright'>
                        {this.props.layers.filter(layer => layer.base_layer).map((layer) => (
                            <BaseLayer checked={layer.checked} name={layer.name} key={layer.name}>
                                <CompositeMapLayer
                                    layer={layer}
                                    hillShading={this.state.hillShading}
                                    lightDirection={this.props.lightDirection}
                                />
                            </BaseLayer>
                        ))}
                        {this.props.layers.filter(layer => !layer.base_layer).map((layer) => (
                            <Overlay checked={layer.checked} name={layer.name} key={layer.name}>
                                <CompositeMapLayer 
                                    layer={layer} 
                                    hillShading={this.state.hillShading} 
                                    lightDirection={this.props.lightDirection}
                                    lineCoords={(coords) => setProps({'polyline_points': coords})}
                                    polygonCoords={(coords) => setProps({'polygon_points': coords})}
                                />
                            </Overlay>
                        ))}
                    </LayersControl>
                    { showDrawControls  && (
                        <FeatureGroup>
                            <DrawControls
                                drawMarker={draw_toolbar_marker}
                                drawPolygon={draw_toolbar_polygon}
                                drawPolyline={draw_toolbar_polyline}
                                lineCoords={(coords) => setProps({'polyline_points': coords})}
                                markerCoords={(coords) => setProps({'marker_point': coords})}
                                polygonCoords={(coords) => setProps({'polygon_points': coords})}
                            />
                        </FeatureGroup>
                    )}
                   { showHillshadingSwitch &&
                        <Switch position='bottomleft' label='Hillshading' checked={this.props.hillShading} onChange={this.handleHillshadingChange.bind(this)} />
                    }
                </Map>
        );
    }
}

LayeredMap.defaultProps = {
    height: 800,
    hillShading: true,
    lightDirection: [1, 1, 1],
    scaleY: 1,
    showScaleY: false,
    draw_toolbar_marker: false,
    draw_toolbar_polygon: false,
    draw_toolbar_polyline: false
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
     * The initial scale of the y axis (relative to the x axis). 
     * A value >1 increases the visual length of the y axis compared to the x axis.
     * Updating this property will override any interactively set y axis scale.
     * This property does not have any effect unless showScaleY is true.
     */
    scaleY: PropTypes.number,

    /**
     * If to show the vertical scale slider or not.
     */
    showScaleY: PropTypes.bool,

    /**
     * Height of the component
     */
    height: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),

    /**
     * Add button to draw a polyline
     */
    draw_toolbar_polyline: PropTypes.bool,

    /**
     * Add button to draw a polygon
     */
    draw_toolbar_polygon: PropTypes.bool,

    /**
     * Add button to draw a marker
     */
    draw_toolbar_marker: PropTypes.bool,

    /**
     * Dash provided prop that returns the coordinates of the edited or clicked polyline
     */
    polyline_points: PropTypes.array,

    /**
     * Dash provided prop that returns the coordinates of the edited or clicked polygon
     */
    polygon_points: PropTypes.array,

    /**
     * Dash provided prop that returns the coordinates of the edited or clicked marker
     */
    marker_point: PropTypes.array,

    /**
     * Light direction.
     */
    lightDirection: PropTypes.array,

    /**
    * Dash-assigned callback that should be called whenever any of the
    * properties change
    */
    setProps: PropTypes.func,

    /**
     * An array of different layers. Each layer is a dictionary with the following structure:
          {
           'name': 'Name of my layer',  // Name of the layer (appears in the map layer control)
           'base_layer': true,
           'checked': false, // If it should be checked initially (only one base layer can have this as True)
           'data': [ ... ] // A list of the different map components this layer consists of (see below for the allowed components)
          }

     * For overlay layers ('base_layer' == false), 'checked' can be tru for an arbitrary number of overlay layers.
     * For base layers maximum one layer should be checked.
     */
    layers: PropTypes.array,

    hillShading: PropTypes.bool

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
*      'colormap': optional - base64 encoding of a 256 x 1 picture representing the colormap
*      'bounds': [[xmin, ymin],  // The extent of the picture in the rendered map
*                 [xmax, ymax]]
       'allowHillshading': false  // optional - if the image is to have hill shading or not (false is default)
       'elevationScale': scale // optional - see ../private-components/layered-map-resources/ImageOverlayWebGL for definition
*     }
*/
