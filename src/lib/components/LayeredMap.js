/* eslint no-inline-comments: 0 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import 'leaflet/dist/leaflet.css';
import {CRS} from 'leaflet';
import { LayersControl, Map, ScaleControl, FeatureGroup } from 'react-leaflet'
import Switch from '../private_components/layered-map-resources/Switch.react'
import CompositeMapLayer from '../private_components/layered-map-resources/CompositeMapLayer.react'
import DrawControls from '../private_components/layered-map-resources/DrawControls.react'
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
        return (
                <Map id={this.props.id} style={{height: LayeredMap.defaultProps.height}}
                     ref={this.mapRef}
                     center={yx(this.props.center)}
                     zoom={-3}
                     minZoom={-5}
                     attributionControl={false}
                     crs={CRS.Simple}>
                    <ScaleControl position='bottomright' imperial={false} metric={true} />
                    <Switch position='topright' label='Hillshading' checked={this.props.hillShading} onChange={this.handleHillshadingChange.bind(this)}/>
                    <LayersControl position='topright'>
                        {this.props.layers.filter(layer => layer.base_layer).map((layer) => (
                            <BaseLayer checked={layer.checked} name={layer.name} key={layer.name}>
                                <CompositeMapLayer layer={layer} hillShading={this.state.hillShading} />
                            </BaseLayer>
                        ))}
                        {this.props.layers.filter(layer => !layer.base_layer).map((layer) => (
                            <Overlay checked={layer.checked} name={layer.name} key={layer.name}>
                                <CompositeMapLayer layer={layer} hillShading={this.state.hillShading} />
                            </Overlay>
                        ))}
                    </LayersControl>
                    <FeatureGroup>
                        <DrawControls
                            lineCoords={(coords) => this.props.setProps({'line_points': coords})}
                            markerCoords={(coords) => this.props.setProps({'marker_point': coords})}
                            polygonCoords={(coords) => this.props.setProps({'polygon_points': coords})} />
                    </FeatureGroup>
                </Map>
        );
    }
}

LayeredMap.defaultProps = {
    height: 800,
    hillShading: true
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
     * The coordinates of the last edited polyline
     */
    line_points: PropTypes.array,

    /**
     * The coordinates of the last edited closed polygon
     */
    polygon_points: PropTypes.array,

    /**
     * The coordinates of the last edited marker
     */
    marker_point: PropTypes.array,

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
*      'bounds': [[xmin, ymin],  // The extent of the picture in the rendered map
*                 [xmax, ymax]]
*     }
*/
