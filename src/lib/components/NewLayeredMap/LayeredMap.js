import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Leaflet
import L from 'leaflet';
import './layers/L.imageWebGLOverlay';

// Assets
import exampleData from '../../../demo/example-data/layered-map.json';

// const TEMP_IMAGE = 'https://i.pinimg.com/originals/67/dd/14/67dd1431cf0d806254a34ad6c0eb0eb5.jpg';
const TEMP_IMAGE = exampleData.layers[0].data[0].url;
const TEMP_COLORMAP = exampleData.layers[0].data[0].colormap;

class LayeredMap extends Component {

    constructor() {
        
    }

    componentDidMount() {
        const map = L.map('map-id', {
            center: [0, 0],
            zoom: 7
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        L.imageWebGLOverlay(TEMP_IMAGE, [[0, 0], [-30, -30]], {
            colormap: TEMP_COLORMAP,
        }).addTo(map);
    }

    render() {
        return (
            <div>
                <div id='map-id' style={{height: '90vh'}}>

                </div>
            </div>
        )
    }

}

LayeredMap.propTypes = {

}

export default LayeredMap;