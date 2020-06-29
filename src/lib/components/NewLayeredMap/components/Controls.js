import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import VerticalZoom from './VerticalZoom';
import Switch from './Switch';

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

                {
                    this.props.switch && (
                        <Switch
                            map={this.props.map}
                            setProps={this.props.setProps}
                            position={this.props.switch.position}
                            value={this.props.switch.value}
                            disabled={this.props.switch.disabled}
                            label={this.props.switch.label}
                        />
                    )
                }
            </div>
        )

    }

}

Controls.propTypes = {
    map: PropTypes.object.isRequired,

    setProps: PropTypes.func,

    scaleY: PropTypes.shape({
        scaleY: PropTypes.number,
        maxScaleY: PropTypes.number,
        minScaleY: PropTypes.number,
        position: PropTypes.string,
    }),
    
    switch: PropTypes.shape({
        value: PropTypes.bool,
        disabled: PropTypes.bool,
        position: PropTypes.string,
        label: PropTypes.string,
    })
}

export default Controls;