import L from "leaflet";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import { buildColormapFromHexColors, DEFAULT_COLORSCALE_CONFIG } from '../colorScale';


class Colorbar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            colorMap : this.props.colorMap
        }
        this.addControl();
    }

    componentDidMount() {
        this.addControl();
        this.checkColormap();
    }
    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.checkColormap();
        }
    }
    
    checkColormap = () => {
        if (this.props.colorScale !== undefined) {
            if (this.props.colorScale.typeOf != 'string') {
                this.setState({colorMap : this.buildColormap(this.props.colorScale)});
            } else { // if  the colorMap is passed to the colorScale as a string
                this.setState({colorMap : this.props.colorScale});
            }
        }
    }

    buildColormap = (colorScale) => {
        const colorScaleCfg = Object.assign({}, DEFAULT_COLORSCALE_CONFIG, colorScale || {});
        const colors = colorScaleCfg.colors;
        return buildColormapFromHexColors(colors, colorScaleCfg);
    }

    addControl = () => {
        const colorbar = L.Control.extend({
            options: {
                position: "bottomright",
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

Colorbar.propTypes = {
    map: PropTypes.object,

    /* Colormap, given as base64 picture data string */
    colorMap: PropTypes.string,

    colorScale: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string
      ]),
    /* Minimum value of color map */
    minvalue: PropTypes.number,

    /* Maximum value of color map */
    maxvalue: PropTypes.number,

    /* Unit to show in color map */
    unit: PropTypes.string,
};

export default Colorbar;
