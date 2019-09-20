import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { ImageOverlay } from 'react-leaflet'
import CanvasOverlay from './CanvasOverlay.react'
import alter_image from './alter_image'

class ImageOverlayWebGL extends Component {

    render() {
        if (typeof this.props.colormap === 'undefined'){
            return <ImageOverlay url={this.props.url} bounds={this.props.bounds} />
        }
        return <CanvasOverlay
            drawMethod={(canvas) => alter_image(canvas, this.props.url, this.props.colormap, this.props.hillShading, this.props.elevationScale, this.props.lightDirection)}
            bounds={this.props.bounds}
        />
    }

}

ImageOverlayWebGL.propTypes = {
  url: PropTypes.string,
  colormap: PropTypes.string,
  bounds: PropTypes.array,
  hillShading: PropTypes.bool
}

export default ImageOverlayWebGL;
