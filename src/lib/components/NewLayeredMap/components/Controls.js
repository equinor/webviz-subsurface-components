
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Components
import VerticalZoom from './VerticalZoom';
import DrawControls from './DrawControls';

class Controls extends Component {


    // render() {
    //     return (
    //         <div>
    //             {
    //                 this.props.scaleY && (
    //                     <VerticalZoom 
    //                         map={this.props.map}
    //                         position={this.props.scaleY.position}
    //                         minScaleY={this.props.scaleY.minScaleY}
    //                         maxScaleY={this.props.scaleY.maxScaleY}
    //                         scaleY={this.props.scaleY.scaleY || 1}
    //                     />
    //                 )
    //             }
    //         </div>
    //     )

    // }
    render() {
        return (
            <div>
                <div> {
                    this.props.drawTools && (
                    <DrawControls
                        map={this.props.map}
                        position={this.props.drawTools.position}
                        drawMarker={this.props.drawTools.drawMarker}
                        drawPolygon={this.props.drawTools.drawPolygon}
                        drawPolyline={this.props.drawTools.drawPolyline}
                        markerCoords={this.props.drawTools.markerCoords}
                        markerCoords={this.props.drawTools.markerCoords}
                        lineCoords={this.props.drawTools.lineCoords}
                        polygonCoords={this.props.drawTools.polygonCoords}
                    />
                    )
                }
                </div>
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
    }),

    drawTools: PropTypes.shape({
        position: PropTypes.string,
        drawMarker: PropTypes.bool,
        drawPolygon: PropTypes.bool,
        drawPolyline: PropTypes.bool,
        markerCoords: PropTypes.func,
        lineCoords: PropTypes.func,
        polygonCoords: PropTypes.func,
    })
}

export default Controls;