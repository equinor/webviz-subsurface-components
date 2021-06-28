/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import React, { Component } from "react";
import PropTypes from "prop-types";

// Components
import VerticalZoom from "./components/VerticalZoom/VerticalZoom";
import DrawControls from "./components/DrawControls";
import ColorBar from "./components/Colorbar";
import ScaleControl from "./components/ScaleControl";
import Switch from "./components/Switch/Switch";
import MousePosition from "./components/MousePosition";

class Controls extends Component {
    render() {
        return (
            <div>
                <div>
                    {this.props.mouseCoords && (
                        <MousePosition
                            map={this.props.map}
                            setProps={this.props.setProps}
                            position={this.props.mouseCoords.position}
                        />
                    )}
                </div>
                <div>
                    {this.props.drawTools && (
                        <DrawControls
                            map={this.props.map}
                            position={this.props.drawTools.position}
                            drawMarker={this.props.drawTools.drawMarker}
                            drawPolygon={this.props.drawTools.drawPolygon}
                            drawPolyline={this.props.drawTools.drawPolyline}
                            lineCoords={(coords) =>
                                this.props.setProps({ polyline_points: coords })
                            }
                            markerCoords={(coords) =>
                                this.props.setProps({ marker_point: coords })
                            }
                            polygonCoords={(coords) =>
                                this.props.setProps({ polygon_points: coords })
                            }
                            syncDrawings={this.props.syncDrawings}
                        />
                    )}
                </div>
                <div>
                    {this.props.scaleY && (
                        <VerticalZoom
                            map={this.props.map}
                            position={this.props.scaleY.position}
                            minScaleY={this.props.scaleY.minScaleY}
                            maxScaleY={this.props.scaleY.maxScaleY}
                            scaleY={this.props.scaleY.scaleY || 1}
                        />
                    )}
                </div>
                <div>
                    {this.props.switch && (
                        <Switch
                            map={this.props.map}
                            setProps={this.props.setProps}
                            position={this.props.switch.position}
                            value={this.props.switch.value}
                            disabled={this.props.switch.disabled}
                            label={this.props.switch.label}
                        />
                    )}
                </div>
                <div>
                    {this.props.colorBar && (
                        <ColorBar
                            map={this.props.map}
                            position={(this.props.colorBar || {}).position}
                        />
                    )}
                </div>
                <div>
                    {this.props.unitScale && (
                        <ScaleControl
                            map={this.props.map}
                            position={(this.props.unitScale || {}).position}
                        />
                    )}
                </div>
            </div>
        );
    }
}

Controls.propTypes = {
    map: PropTypes.object.isRequired,
    setProps: PropTypes.func,

    mouseCoords: PropTypes.shape({
        position: PropTypes.string,
    }),

    colorBar: PropTypes.shape({
        position: PropTypes.string,
    }),

    unitScale: PropTypes.shape({
        position: PropTypes.string,
    }),

    syncDrawings: PropTypes.bool,

    mousePosition: PropTypes.shape({
        coordinatePosition: PropTypes.string,
    }),
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
    }),

    switch: PropTypes.shape({
        value: PropTypes.bool,
        disabled: PropTypes.bool,
        position: PropTypes.string,
        label: PropTypes.string,
    }),
};

export default Controls;
