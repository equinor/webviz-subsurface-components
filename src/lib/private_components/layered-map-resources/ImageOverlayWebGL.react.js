import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { ImageOverlay } from 'react-leaflet'
import CanvasOverlay from './CanvasOverlay.react'
import alter_image from './alter_image'

class ImageOverlayWebGL extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        if (typeof this.props.colormap === 'undefined'){
            return <ImageOverlay url={this.props.url} bounds={this.props.bounds} />
        } else {
            const drawMethod = (canvas) => alter_image(this.props.url, this.props.colormap, canvas)
            return <CanvasOverlay drawMethod={drawMethod} bounds={this.props.bounds} />
        }
    }
}

ImageOverlayWebGL.propTypes = {
  url: PropTypes.string,
  colormap: PropTypes.string,
  bounds: PropTypes.array
}

export default ImageOverlayWebGL;
