/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import React, { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import Context from "../../../utils/context";

// Leaflet
import L from "leaflet";

// Utils
import { buildColormap } from "../../../utils/colorScale";

const ColorBar = (props) => {
    const { focusedImageLayer = {} } = useContext(Context);

    // State
    const [control, setControl] = useState(null);
    const [colormap, setColormap] = useState(null);
    const [minMaxValue, setMinMaxValue] = useState([0, 0]);
    const [unit, setUnit] = useState(null);

    useEffect(() => {
        addControl();
        createNewColormap();
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
        createNewColormap();
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

    const createNewColormap = () => {
        if (!focusedImageLayer) {
            return;
        }

        const options = focusedImageLayer.options || {};
        const colorScale = options.colorScale;
        if (colorScale) {
            setColormap(buildColormap(colorScale));
            setMinMaxValue([options.minvalue, options.maxvalue]);
        } else if (!colorScale && options.url) {
            setColormap(buildColormap(["#FFFFFF"]));
            setMinMaxValue([options.minvalue, options.maxvalue]);
        } else {
            setColormap(null);
        }
    };

    const addControl = () => {
        const ColorBarCtrl = L.Control.extend({
            options: {
                position: props.position || "bottomright",
            },
            onAdd: function () {
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

    if (!colormap || minMaxValue.length !== 2 || !control) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className="leaflet-colorbar">
            <div className="leaflet-colorbar-image">
                {colormap && (
                    <img
                        key={colormap}
                        src={colormap}
                        style={{ width: "100%", height: "10px" }}
                    />
                )}
            </div>
            <div>
                {minMaxValue[0].toFixed(2)} {unit}
            </div>
            <div className="leaflet-colorbar-right-label">
                {minMaxValue[1].toFixed(2)} {unit}
            </div>
        </div>,
        control.panelDiv
    );
};

ColorBar.propTypes = {
    map: PropTypes.object,
    position: PropTypes.object,
};

export default ColorBar;
