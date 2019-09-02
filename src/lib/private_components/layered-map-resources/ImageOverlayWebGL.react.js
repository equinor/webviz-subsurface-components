import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { ImageOverlay } from 'react-leaflet'
import CanvasOverlay from './CanvasOverlay.react'
import alter_image from './alter_image'

class ImageOverlayWebGL extends Component {

    constructor(props) {
        super(props)
        this.state = {drawMethod: (canvas) => alter_image(this.props.url, this.props.colormap, this.props.hillShading, canvas)}
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.hillShading !== nextProps.hillShading || this.props.url !== nextProps.url || this.props.colormap !== nextProps.colormap) {
            this.setState({drawMethod: (canvas) => alter_image(nextProps.url, nextProps.colormap, nextProps.hillShading, canvas)})
        }
    }

    render() {
        if (typeof this.props.colormap === 'undefined'){
            return <ImageOverlay url={this.props.url} bounds={this.props.bounds} />
        }
        return <CanvasOverlay drawMethod={this.state.drawMethod} bounds={this.props.bounds} />
    }
}

ImageOverlayWebGL.propTypes = {
  url: PropTypes.string,
  colormap: PropTypes.string,
  bounds: PropTypes.array,
  hillShading: PropTypes.bool
}

export default ImageOverlayWebGL;
