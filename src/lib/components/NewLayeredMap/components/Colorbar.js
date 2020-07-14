import L from "leaflet";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import { buildColormapFromHexColors, DEFAULT_COLORSCALE_CONFIG } from '../colorscale';


class ColorBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            colorMap : this.props.colorMap
        }
        this.addControl();
    }

    componentDidMount() {
        this.addControl();
        this.checkColorMap();
    }
    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.checkColorMap();
        }
    }
    
    checkColorMap = () => {
        if (this.props.colorScale !== undefined) {
            if (typeof this.props.colorScale !== 'string') {
                this.setState({colorMap : this.buildColorMapImage(this.props.colorScale)});
            } else { // if  the colorMap is passed to the colorScale as a string
                this.setState({colorMap : this.props.colorScale});
            }
        }
    }

    buildColorMapImage = (colorScale) => {
        const colorScaleCfg = Object.assign({}, DEFAULT_COLORSCALE_CONFIG, colorScale || {});
        const colors = colorScaleCfg.colors;
        return buildColormapFromHexColors(colors, colorScaleCfg);
    }

    addControl = () => {
        const colorbar = L.Control.extend({
            options: {
                position: this.props.position || "bottomright",
            },
            onAdd: () => {
                this.panelDiv = L.DomUtil.create(
                    "div",
                    "leaflet-custom-control"
                );
                return this.panelDiv;
            },
        });
        this.colorbar = new colorbar();

        this.props.map.addControl(this.colorbar);
    }


    render() {
        return ReactDOM.createPortal(
            <div className="leaflet-colorbar">
                <div className="leaflet-colorbar-image">
                    <img
                        src={this.state.colorMap}
                        style={{ width: "100%", height: "10px" }}
                    />
                </div>
                <div>
                    {this.props.minvalue} {this.props.unit}
                </div>
                <div className="leaflet-colorbar-right-label">
                    {this.props.maxvalue} {this.props.unit}
                </div>
            </div>,
            this.panelDiv
        );
    }
}

ColorBar.propTypes = {
    map: PropTypes.object,


    colorScale: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string
    ]),

    /* Minimum value of color map */
    minvalue: PropTypes.number.isRequired,

    /* Maximum value of color map */
    maxvalue: PropTypes.number.isRequired,

    /* Unit to show in color map */
    unit: PropTypes.string,
};

export default ColorBar;
