import React, { useState, useEffect, useContext, useCallback } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Context from '../../../context';

import L from "leaflet";


const ScaleControl = (props) => {
    const { focusedImageLayer = {} } = useContext(Context);

    // State
    const [scaleControl, setScaleControl] = useState(null);

    useEffect(() => {
        addControl();
        setScaleControl();
    }, [])

    const focusedDependencyArray = () => {
        if(!focusedImageLayer) {
            return [null];
        }
        const options = focusedImageLayer.options || {};
        return [options.unit];
    }

    useEffect(() => {
        updateScaleControl();
    }, focusedDependencyArray())

    const focusedDependencyArray = () => {
        const options = (focusedImageLayer || {}).options || {};
        return [newCanvas, newURL, options.minvalue, options.maxvalue, options.unit];
    }
    
    const updateScaleControl = () => {
        if(scaleControl) {
            props.map.removeControl(scaleControl);
        }
        addControl(props.map);
        
    }

    const addControl = (map) => {
        if(!focusedImageLayer) {
            return;
        }
        const options = (focusedImageLayer.options || {});
        const unit = options.unit ? options.unit : "m";

        const feet = (unit === "ft" || unit === "feet");
        const control = L.control.scale({metric: !feet, imperial: feet, position: props.position});
        setScaleControl(control);
        control.addTo(map);
    }

    return null;

}


ScaleControl.propTypes = {

    /**
     * The map employed by the main component
     */
    map: PropTypes.object.isRequired,

    position: PropTypes.string,

};

ScaleControl.defaultProps = {
    position: "bottomright",
}

export default ScaleControl;
