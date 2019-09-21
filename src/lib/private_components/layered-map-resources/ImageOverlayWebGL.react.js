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
    hillShading: PropTypes.bool,

    /**
     * Used in hillshading. Dictates relative ratio between vertical elevation
     * axis (z) and horizontal axes (x and y). The correct physical value would
     * be |(max z - min z) * (width image) / (max x - min x)|, or equivalently
     * be |(max z - min z) * (height image) / (max y - min y)|.
     * Note however that it is not crucial that the value is physically correct,
     * as the value here can be seen as an artistic choice.
     */
    elevationScale: PropTypes.number,

    /**
     * Light direction (array of length 3), used when hillShading is true.
     */
    lightDirection: PropTypes.array
}

export default ImageOverlayWebGL;
