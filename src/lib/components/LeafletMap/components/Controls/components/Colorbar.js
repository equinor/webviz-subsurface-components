import React, { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Context from "../../../context";

// Leaflet
import L from "leaflet";

// Utils
import { buildColormap } from "../../../utils/colorScale";

const ColorBar = props => {
    const { focusedImageLayer = {} } = useContext(Context);

    // State
    const [control, setControl] = useState(null);
    const [colorMap, setColorMap] = useState(null);
    const [minMaxValue, setMinMaxValue] = useState([0, 0]);
    const [unit, setUnit] = useState(null);

    useEffect(() => {
        addControl();
        createNewColorMap();
        updateUnit();
    }, []);

    const focusedDependencyArray = () => {
        if (!focusedImageLayer) {
            return [null, null, null, null];
        }

        const options = focusedImageLayer.options;
        return [
            JSON.stringify(options.colorScale),
            options.minvalue,
            options.maxvalue,
            options.unit,
        ];
    };

    useEffect(() => {
        createNewColorMap();
        updateUnit();
    }, focusedDependencyArray());

    const updateUnit = () => {
        if (!focusedImageLayer) {
            return;
        }
        const options = focusedImageLayer.options || {};
        const unit = options.unit ? options.unit : "m";
        setUnit(unit);
    };

    const createNewColorMap = () => {
        if (!focusedImageLayer) {
            return;
        }

        const options = focusedImageLayer.options || {};
        const colorScale = options.colorScale;
        if (colorScale) {
            setColorMap(buildColormap(colorScale));
            setMinMaxValue([options.minvalue, options.maxvalue]);
        } else if (!colorScale && options.url) {
            setColorMap(buildColormap(["#FFFFFF"]));
            setMinMaxValue([options.minvalue, options.maxvalue]);
        } else {
            setColorMap(null);
        }
    };

    const addControl = () => {
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
    };

    if (!colorMap || minMaxValue.length !== 2 || !control) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className="leaflet-colorbar">
            <div className="leaflet-colorbar-image">
                {colorMap && (
                    <img
                        key={colorMap}
                        src={colorMap}
                        style={{ width: "100%", height: "10px" }}
                    />
                )}
            </div>
            <div>
                {minMaxValue[0]} {unit}
            </div>
            <div className="leaflet-colorbar-right-label">
                {minMaxValue[1]} {unit}
            </div>
        </div>,
        control.panelDiv
    );
};

ColorBar.propTypes = {
    map: PropTypes.object,
};

export default ColorBar;
