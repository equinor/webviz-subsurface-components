import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

// Leaflet
import L from 'leaflet';
import './layers/L.imageWebGLOverlay';

// Assets
import exampleData from '../../../demo/example-data/layered-map.json';

// Constants
// const TEMP_IMAGE = 'https://i.pinimg.com/originals/67/dd/14/67dd1431cf0d806254a34ad6c0eb0eb5.jpg';
const TEMP_IMAGE = exampleData.layers[0].data[0].url;
const TEMP_COLORMAP = exampleData.layers[0].data[0].colormap;
const DEFAULT_BOUNDS = [[0, 0], [30, 30]]


class LayeredMap extends Component {

    constructor(props) {
        this.state = {
            map: null,
            layers: props.layers || [],
            bounds: null,
        }

        this.mapEl = createRef();
    }

    componentDidMount() {
        const map = L.map(this.mapEl, {
            CRS: L.CRS.Simple,
            center: [432205, 6475078],
            zoom: 1
        });

        this.setState({map: map}, () => {
            let firstBounds = null;
            this.state.layers.forEach((layer) => {
                (layer.data || []).forEach((layerMap) => {
                    const [_, bounds, _ ] = this.addLayerDataToMap(layerMap);
                    firstBounds = firstBounds === null ? bounds : firstBounds;
                })
            })

            console.log("Last bounds:", firstBounds);
            map.fitBounds(firstBounds);
            this.setState({bounds: firstBounds})
        });


        

       /*  L.polyline([[0 ,0], [0, 30]], {color: 'red'}).addTo(map);
        L.polyline([[0 ,30], [30, 30]], {color: 'red'}).addTo(map);
        L.polyline([[30 ,30], [30, 0]], {color: 'red'}).addTo(map);
        L.polyline([[30 ,0], [0, 0]], {color: 'red'}).addTo(map); */

        
    }

    addLayerDataToMap = (layerData) => {
        if(!layerData) {
            return;
        }

        let newLayer = null;
        const url = layerData.url;
        const colormap = layerData.colormap;
        const bounds = layerData.bounds || DEFAULT_BOUNDS;

        switch(layerData.type) {
            
            case 'image': {
                if(colormap) {
                    newLayer = L.imageWebGLOverlay(url, bounds, {
                        colormap: colormap,
                        clr: L.CRS.Simple,
                    });
                } else {
                    newLayer = L.imageOverlay(url, bounds, {
                        
                    });
                }
                break;
            }

            case 'tile': {
                newLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
                break;
            }
        
        }

        if(newLayer) {
            newLayer.addTo(this.state.map);
        }

        return [url, bounds, colormap];
    }

    render() {
        return (
            <div>
                <div
                    ref={el => this.mapEl = el} 
                    style={{height: '90vh'}}>

                </div>
            </div>
        )
    }

}

LayeredMap.propTypes = {
    layers: PropTypes.array,
}

export default LayeredMap;