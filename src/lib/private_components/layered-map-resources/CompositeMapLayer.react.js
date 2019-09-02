import React, {Component} from 'react'
import PropTypes from 'prop-types'
import ImageOverlayWebGL from './ImageOverlayWebGL.react'
import Colormap from './Colormap.react'

import {
  Circle,
  LayerGroup,
  Polygon,
  Polyline,
  Tooltip
} from 'react-leaflet'

const yx = ([x,y]) => {return [y, x]}

class CompositeMapLayer extends Component {

    render_tooltip(item){
        if ('tooltip' in item){
            return <Tooltip sticky={true}>{item.tooltip}</Tooltip>
        }
        return null
    }

    render() {
        return (
            <LayerGroup>
                {
                    this.props.layer.data.map((item, index) => {
                        switch(item.type) {
                            case 'polyline':
                                return (
                                    <Polyline
                                      color={item.color}
                                      positions={item.positions.map(xy => yx(xy))}
                                      key={index}
                                    >
                                        {this.render_tooltip(item)}
                                    </Polyline>
                                )
                            case 'polygon':
                                return (
                                    <Polygon
                                      color={item.color}
                                      positions={item.positions.map(xy => yx(xy))}
                                      key={index}
                                    >
                                        {this.render_tooltip(item)}
                                    </Polygon>
                                )
                            case 'circle':
                                return (
                                    <Circle
                                      color={item.color}
                                      center={yx(item.center)}
                                      radius={item.radius}
                                      key={index}
                                    >
                                        {this.render_tooltip(item)}
                                    </Circle>
                                )
                            case 'image':
                                return (
                                    <>
                                        <ImageOverlayWebGL
                                          url={item.url}
                                          colormap={item.colormap}
                                          bounds={item.bounds.map(xy => yx(xy))}
                                          hillShading={this.props.hillShading}
                                          key={index}
                                        />
                                        { 'colormap' in item && <Colormap colormap={item.colormap} unit={item.unit} minvalue={item.minvalue} maxvalue={item.maxvalue} position='bottomleft' key={'colormap' + index} /> }
                                    </>
                                )
                            default:
                                return null
                        }
                    })
                }
            </LayerGroup>
        )
    }

}

CompositeMapLayer.propTypes = {
    /* Data for one single layer. See parent component LayeredMap for documentation.
     */
    layers: PropTypes.object,
    hillShading: PropTypes.bool
};


export default CompositeMapLayer;
