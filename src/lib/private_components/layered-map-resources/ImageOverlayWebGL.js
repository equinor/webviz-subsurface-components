import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { ImageOverlay } from 'react-leaflet'
import alter_image from './alter_image'

class ImageOverlayWebGL extends Component {
  constructor(props) {
    super(props)

    if (typeof this.props.colormap === 'undefined') {
        this.state = {'data': this.props.url}
    } else {
        this.state = {'data': ''}
        alter_image(this.props.url, this.props.colormap).then(resp => this.setState({'data': resp}));
    }
  }

  render() {
    return <ImageOverlay url={this.state.data} bounds={this.props.bounds} />
  }
}

ImageOverlayWebGL.propTypes = {
  url: PropTypes.string,
  colormap: PropTypes.string,
  bounds: PropTypes.array
}

export default ImageOverlayWebGL;
