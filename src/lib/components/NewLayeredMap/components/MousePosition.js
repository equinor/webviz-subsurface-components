import React, { Component, useEffect, useContext, useState, useRef } from "react";
import PropTypes from "prop-types";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";

// Components
import Context from '../Context';

// Constants
const NUMBER_COLOR_CHANNELS = 4;
const NUMBER_DISCRETIZATION_LEVELS = 255;

const MousePosition = (props) => {
    const { focusedImageLayer } = useContext(Context);

    // As useState-values are not available in eventListeners,
    // stateRef is. Using that to maintain state instead.
    const stateRef = useRef({});

    // ComponentDidMount
    useEffect(() => {
        addControl();
        subscribeToMapClick();
    }, [])


    const focusedDependencyArray = () => {
        const options = (focusedImageLayer || {}).options || {};
        return [options.minvalue, options.maxvalue];
    }

    useEffect(() => {
        updateCanvas();
    }, focusedDependencyArray())

    useEffect(() => {
        updateProps();
    }, [props])

    const updateStateCanvas = (canvas, onScreenCanvas, ctx, minvalue, maxvalue) => {
        stateRef.current = { ...stateRef.current, canvas, ctx, onScreenCanvas, minvalue, maxvalue, props};
    }

    const updateProps = () => {
        stateRef.current.props = props;
    }

    const addControl = () => {
        let MousePosControl = L.Control.extend({ 
            options: {  
                position: props.position
            },
    
            onAdd: function (map) {
                const latlng = L.DomUtil.create('div', 'mouseposition');
                this._latlng = latlng;
                return latlng;
            },
    
            updateHTML: function(x, y, z, zNotZero) { // TODO: add default measurement unit, make it passable with props
                const z_string = zNotZero? " z: " + z + "m" : "";
                this._latlng.innerHTML ="<span style = 'background-color: #ffffff; border: 2px solid #ccc; padding:3px; border-radius: 5px;'>"
                                       + "x: " + x + "m y: " + y + "m"  + z_string +"</span>"
            }
        });
        const mousePosCtrl = new MousePosControl();
        props.map.addControl(mousePosCtrl);
        stateRef.current = stateRef.current || {};
        stateRef.current.control = mousePosCtrl;
    };

    const updateCanvas = async () => {
        if(!focusedImageLayer) {
            return;
        }

        const url = focusedImageLayer.getUrl ? focusedImageLayer.getUrl() : null;
        const onScreenCanvas = focusedImageLayer.getCanvas ? focusedImageLayer.getCanvas() : null;
        const minvalue = (focusedImageLayer.options || {}).minvalue;
        const maxvalue = (focusedImageLayer.options || {}).maxvalue;
        if(!url || !onScreenCanvas || !minvalue || !maxvalue) { // TODO fix minvalue = 0
            return;
        }

        /**
         * @type {Image}
         */
        const image = await new Promise((res, rej) => {
            const image = new Image();
            image.onload = () => {
                res(image);
            }
            image.src = url;
        });
        

        const imageCanvas = document.createElement('canvas');
        const ctx = imageCanvas.getContext("2d");
        imageCanvas.width = image.width;
        imageCanvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        updateStateCanvas(imageCanvas, onScreenCanvas, ctx, minvalue, maxvalue);
    }

    const onCanvasMouseMove = (event) => {
        const { canvas, ctx, onScreenCanvas} = stateRef.current || {};
        if(!canvas) {
            return;
        }
        const clientRect = onScreenCanvas.getBoundingClientRect();
        const screenX = ((event.originalEvent.clientX - clientRect.left) / clientRect.width) * canvas.width;
        const screenY = ((event.originalEvent.clientY - clientRect.top) / clientRect.height) * canvas.height;

        const x = Math.round(event.latlng.lng);
        const y = Math.round(event.latlng.lat);
        const red = ctx.getImageData(screenX, screenY, 1, 1).data[0]; // TODO: store this locally 
        const z = getZValue(red);

        z = mapZValue(red)

        setLatLng(x, y, z, red > 0);
    }

    const onCanvasMouseClick = (event) => {
        const { canvas, ctx, onScreenCanvas, props} = stateRef.current || {};
        if(!canvas) {
            return;
        }
        const clientRect = onScreenCanvas.getBoundingClientRect();
        const screenX = ((event.originalEvent.clientX - clientRect.left) / clientRect.width) * canvas.width;
        const screenY = ((event.originalEvent.clientY - clientRect.top) / clientRect.height) * canvas.height;

        if(screenX === Infinity || screenY === Infinity) {
            return;
        }

        const x = Math.round(event.latlng.lng);
        const y = Math.round(event.latlng.lat);
        const red = ctx.getImageData(screenX, screenY, 1, 1).data[0]; // TODO: store this locally 
        const z = mapZValue(red);
        
        if(props.setProps) {
            props.setProps({click_position: [x, y, z]});
        }
        
    }

    const subscribeToMapClick = () => {
        props.map.addEventListener('mousemove', onCanvasMouseMove)
        props.map.addEventListener('click', onCanvasMouseClick)
    }

    const mapZValue = (redColorvalue) => {
        const { minvalue, maxvalue } = stateRef.current || {};
        return Math.floor(minvalue + ((maxvalue - minvalue) / (255 - 0)) * (redColorvalue - 0))

    }
    
    //OLD method
    const getZValue = (redColorValue) => {
        const { props } = stateRef.current;

        return Math.floor(
          ((props.maxvalue - props.minvalue) *
              (redColorValue - 1)) /
              NUMBER_DISCRETIZATION_LEVELS +
              props.minvalue
        );
    }
  
    const setLatLng = (x, y, z, zNotZero)  => {
        const { control } = stateRef.current || {};
        if(control) {
            control.updateHTML(x, y, z, zNotZero)
        }
    }

    return null;
}


MousePosition.defaultProps = {
    position: "bottomleft",
}

MousePosition.propTypes = {
    position: PropTypes.string,
    setProps: PropTypes.oneOfType([PropTypes.func, PropTypes.any]),
    map: PropTypes.object.isRequired,
    minvalue : PropTypes.number,
    maxvalue: PropTypes.number,
    position: PropTypes.string,
}

export default MousePosition;