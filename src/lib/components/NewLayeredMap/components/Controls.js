import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import VerticalZoom from './VerticalZoom';

class Controls extends Component {


    render() {
        return (
            <div>
                {
                    this.props.scaleY && (
                        <VerticalZoom 
                            map={this.props.map}
                            position={this.props.scaleY.position}
                            minScaleY={this.props.scaleY.minScaleY}
                            maxScaleY={this.props.scaleY.maxScaleY}
                            scaleY={this.props.scaleY.scaleY || 1}
                        />
                    )
                }
            </div>
        )

    }

}

Controls.propTypes = {
    map: PropTypes.object.isRequired,

    scaleY: PropTypes.shape({
        scaleY: PropTypes.number,
        maxScaleY: PropTypes.number,
        minScaleY: PropTypes.number,
        position: PropTypes.string,
    })
}

export default Controls;