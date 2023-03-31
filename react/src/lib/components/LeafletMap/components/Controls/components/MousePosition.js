/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import { useEffect, useContext, useRef } from "react";
import PropTypes from "prop-types";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";

// Context
import Context from "../../../utils/context";

// Constants

const MousePosition = (props) => {
    const { focusedImageLayer, mode } = useContext(Context);

    // As useState-values are not available in eventListeners,
    // stateRef is. Using that to maintain state instead.
    const stateRef = useRef({});

    // ComponentDidMount
    useEffect(() => {
        addControl();
        subscribeToMapClick();
    }, []);

    const focusedDependencyArray = () => {
        const options = (focusedImageLayer || {}).options || {};
        const newURL =
            focusedImageLayer && focusedImageLayer.getUrl
                ? focusedImageLayer.getUrl()
                : null;
        const newCanvas =
            focusedImageLayer && focusedImageLayer.getCanvas
                ? focusedImageLayer.getCanvas()
                : null;
        return [
            newCanvas,
            newURL,
            options.minvalue,
            options.maxvalue,
            options.unit,
        ];
    };

    useEffect(() => {
        updateCanvas();
    }, focusedDependencyArray());

    useEffect(() => {
        updateProps();
    }, [props]);

    useEffect(() => {
        updateMode(mode);
    }, [mode]);

    const updateStateCanvas = (
        canvas,
        onScreenCanvas,
        ctx,
        minvalue,
        maxvalue,
        unit
    ) => {
        stateRef.current = {
            ...stateRef.current,
            canvas,
            ctx,
            onScreenCanvas,
            minvalue,
            maxvalue,
            unit,
            props,
        };
    };

    const updateMode = (mode) => {
        stateRef.current.mode = mode;
    };

    const updateProps = () => {
        stateRef.current.props = props;
    };

    const addControl = () => {
        let MousePosControl = L.Control.extend({
            options: {
                position: props.position,
            },

            onAdd: function () {
                const latlng = L.DomUtil.create("div", "mouseposition");
                this._latlng = latlng;
                return latlng;
            },

            updateHTML: function (x, y, z, zNotZero, unit) {
                // TODO: add default measurement unit, make it passable with props
                const newUnit = unit === undefined ? "m" : unit;
                const z_string = zNotZero ? " z: " + z + newUnit : "";
                this._latlng.innerHTML =
                    "<span style = 'background-color: #ffffff; border: 2px solid #ccc; padding:3px; border-radius: 5px;'>" +
                    "x: " +
                    x +
                    newUnit +
                    " y: " +
                    y +
                    newUnit +
                    z_string +
                    "</span>";
            },
        });
        const mousePosCtrl = new MousePosControl();
        props.map.addControl(mousePosCtrl);
        stateRef.current = stateRef.current || {};
        stateRef.current.control = mousePosCtrl;
    };

    const updateCanvas = async () => {
        if (!focusedImageLayer) {
            return;
        }

        const url = focusedImageLayer.getUrl
            ? focusedImageLayer.getUrl()
            : null;
        const onScreenCanvas = focusedImageLayer.getCanvas
            ? focusedImageLayer.getCanvas()
            : null;
        const minvalue = (focusedImageLayer.options || {}).minvalue;
        const maxvalue = (focusedImageLayer.options || {}).maxvalue;
        const unit = (focusedImageLayer.options || {}).unit;
        if (
            !url ||
            !onScreenCanvas ||
            !(typeof minvalue === "number") ||
            !maxvalue
        ) {
            return;
        }

        /**
         * @type {Image}
         */
        const image = await new Promise((res) => {
            const image = new Image();
            image.onload = () => {
                res(image);
            };
            image.src = url;
        });

        const imageCanvas = document.createElement("canvas");
        const ctx = imageCanvas.getContext("2d");
        imageCanvas.width = image.width;
        imageCanvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        updateStateCanvas(
            imageCanvas,
            onScreenCanvas,
            ctx,
            minvalue,
            maxvalue,
            unit
        );
    };

    const onCanvasMouseMove = (event) => {
        const { canvas, ctx, onScreenCanvas } = stateRef.current || {};
        if (!canvas) {
            return;
        }
        const clientRect = onScreenCanvas.getBoundingClientRect();
        const screenX =
            ((event.originalEvent.clientX - clientRect.left) /
                clientRect.width) *
            canvas.width;
        const screenY =
            ((event.originalEvent.clientY - clientRect.top) /
                clientRect.height) *
            canvas.height;

        if (screenX === Infinity || screenY === Infinity) {
            return;
        }

        const x = Math.round(event.latlng.lng);
        const y = Math.round(event.latlng.lat);
        const [r, g, b, a] = ctx.getImageData(screenX, screenY, 1, 1).data; // TODO: store this locally
        const z = mapZValue(r, g, b);

        setLatLng(x, y, z, a > 0);
    };

    const mapXCoordinateToCanvas = (x, clientRect, canvas) => {
        return ((x - clientRect.left) / clientRect.width) * canvas.width;
    };
    const mapYCoordinateToCanvas = (y, clientRect, canvas) => {
        return ((y - clientRect.top) / clientRect.height) * canvas.height;
    };

    const onCanvasMouseClick = (event) => {
        const { canvas, ctx, onScreenCanvas, props } = stateRef.current || {};
        if (!canvas) {
            return;
        }

        const clientRect = onScreenCanvas.getBoundingClientRect();
        const screenX = mapXCoordinateToCanvas(
            event.originalEvent.clientX,
            clientRect,
            canvas
        );
        const screenY = mapYCoordinateToCanvas(
            event.originalEvent.clientY,
            clientRect,
            canvas
        );

        if (screenX === Infinity || screenY === Infinity) {
            return;
        }

        const x = Math.round(event.latlng.lng);
        const y = Math.round(event.latlng.lat);
        const [r, g, b] = ctx.getImageData(screenX, screenY, 1, 1).data; // TODO: store this locally
        const z = mapZValue(r, g, b);

        // Used to disable map.on("click") events when pressed on the controls
        const controlsList = document.getElementsByClassName(
            "leaflet-custom-control leaflet-control"
        );
        const forbiddenCoordinates = [];

        for (const control of controlsList) {
            const controlBounds = control.getBoundingClientRect();

            const forbiddenYValueRange = [
                mapYCoordinateToCanvas(controlBounds.y, controlBounds, canvas),
                mapYCoordinateToCanvas(
                    controlBounds.y + controlBounds.height,
                    controlBounds,
                    canvas
                ),
            ];
            const forbiddenXValueRange = [
                mapXCoordinateToCanvas(controlBounds.x, controlBounds, canvas),
                mapXCoordinateToCanvas(
                    controlBounds.x + controlBounds.width,
                    controlBounds,
                    canvas
                ),
            ];

            forbiddenCoordinates.push([
                forbiddenYValueRange,
                forbiddenXValueRange,
            ]);
        }

        if (
            props.setProps &&
            stateRef.current.mode !== "editing" &&
            !isForbidden(
                event.originalEvent.clientX,
                event.originalEvent.clientY,
                forbiddenCoordinates
            )
        ) {
            props.setProps({ click_position: [x, y, z] });
        }
    };

    const isForbidden = (x, y, forbiddenCoordinates) => {
        let forbidden = false;
        for (const coordinates of forbiddenCoordinates) {
            const xRange = coordinates[0];
            const yRange = coordinates[1];

            if (
                x > xRange[0] &&
                x < xRange[1] &&
                y > yRange[0] &&
                y < yRange[1]
            ) {
                forbidden = true;
            }
        }

        return forbidden;
    };

    const subscribeToMapClick = () => {
        props.map.addEventListener("mousemove", onCanvasMouseMove);
        props.map.addEventListener("mouseup", onCanvasMouseClick);
    };

    const mapZValue = (r, g, b) => {
        const { minvalue, maxvalue } = stateRef.current || {};

        const elevation = r * 256.0 * 256.0 + g * 256.0 + b;
        const scaleFactor =
            (maxvalue - minvalue) / (256.0 * 256.0 * 256.0 - 1.0);
        return roundOff(elevation * scaleFactor + minvalue);
    };

    const roundOff = (n) => {
        // Returns two significant figures (non-zero) for numbers with an absolute value less
        // than 1, and two decimal places for numbers with an absolute value greater
        // than 1.
        return parseFloat(
            n.toExponential(Math.max(1, 2 + Math.log10(Math.abs(n))))
        );
    };

    const setLatLng = (x, y, z, zNotZero) => {
        const { control, unit } = stateRef.current || {};
        if (control) {
            control.updateHTML(x, y, z, zNotZero, unit);
        }
    };

    return null;
};

MousePosition.defaultProps = {
    position: "bottomleft",
};

MousePosition.propTypes = {
    position: PropTypes.string,
    setProps: PropTypes.oneOfType([PropTypes.func, PropTypes.any]),
    map: PropTypes.object.isRequired,
    minvalue: PropTypes.number,
    maxvalue: PropTypes.number,
};

export default MousePosition;
