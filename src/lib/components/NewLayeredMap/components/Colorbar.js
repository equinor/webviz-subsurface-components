import React, { useState, useEffect, useContext, useCallback } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Context from '../Context';

// Leaflet
import L from "leaflet";

// Utils
import { buildColormap } from '../colorscale';


const ColorBar = (props) => {
    const { focusedImageLayer } = useContext(Context);

    // State
    const [control, setControl] = useState(null);
    const [colorMap, setColorMap] = useState(null);
    const [minMaxValue, setMinMaxValue]= useState([0 , 0])


    useEffect(() => {
        addControl();
        createNewColorMap();
    }, [])

    useEffect(() => {
        if(focusedImageLayer) {
            createNewColorMap();
        }

    }, [focusedImageLayer])
    
    const createNewColorMap = () => {
        const options = (focusedImageLayer.options || {})
        const colorScale = options.colorScale;
        if(colorScale) {
            setColorMap(buildColormap(colorScale))
            setMinMaxValue([options.minvalue, options.maxvalue])
        } else {
            setColorMap(null);
        }
    }

    const addControl = () => {
        let panelDiv = null;
        const ColorBarCtrl = L.Control.extend({
            options: {
                position: props.position || "bottomright",
            },
            onAdd: function() {
                this.panelDiv = L.DomUtil.create(
                    "div",
                    "leaflet-custom-control"
                );
                return this.panelDiv;
            },
        });
        const newColorBarCtrl = new ColorBarCtrl();
        props.map.addControl(newColorBarCtrl);
        setControl(newColorBarCtrl);
    }


    if(!colorMap || minMaxValue.length !== 2 || !control) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className="leaflet-colorbar">
            <div className="leaflet-colorbar-image">
                <img
                    src={colorMap}
                    style={{ width: "100%", height: "10px" }}
                />
            </div>
            <div>
                {minMaxValue[0]} {props.unit}
            </div>
            <div className="leaflet-colorbar-right-label">
                {minMaxValue[1]} {props.unit}
            </div>
        </div>,
        control.panelDiv
    );
}

ColorBar.propTypes = {
    map: PropTypes.object,

    /* Unit to show in color map */
    unit: PropTypes.string,
};

ColorBar.defaultProps = {
    unit: "m",
}

export default ColorBar;
