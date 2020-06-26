import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

// Leaflet
import L from 'leaflet';
import './layers/L.imageWebGLOverlay';
import './layers/L.tileWebGLLayer';

// Components
import Controls from './components/Controls';

// Assets
import exampleData from '../../../demo/example-data/layered-map.json';

// Constants
// const TEMP_IMAGE = 'https://i.pinimg.com/originals/67/dd/14/67dd1431cf0d806254a34ad6c0eb0eb5.jpg';
const TEMP_IMAGE = exampleData.layers[0].data[0].url;
const TEMP_COLORMAP = exampleData.layers[0].data[0].colormap;
const DEFAULT_BOUNDS = [[0, 0], [30, 30]]

const stringToCRS = (crsString) => {
    switch(crsString) {
        case 'simple': {
            return L.CRS.Simple;
        }

        default:
            return L.CRS.EPSG3857;
    }
}

class NewLayeredMap extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            map: null,
            layers: props.layers || [],
            minZoom: props.minZoom || 1,
            maxZoom: props.maxZoom || 15,
            zoom: props.zoom || 1,
            crs: stringToCRS(props.crs),
            center: props.center || [0, 0],
            bounds: props.bounds,
            controls: props.controls || {},
        }

        this.mapEl = createRef();
    }

    componentDidMount() {
        const map = L.map(this.mapEl, {
            crs: this.state.crs,
            center: this.state.center,
            zoom: this.state.zoom,
            minZoom: this.state.minZoom,
            maxZoom: this.state.maxZoom,
        });

        this.setState({map: map}, () => {
            this.state.layers.forEach((layer) => {
                (layer.data || []).forEach(this.addLayerDataToMap)
            })
            
            if(this.state.bounds) {
                map.fitBounds(this.state.bounds);
            }
        });


        // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        /* L.tileWebGLLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', TEMP_COLORMAP, {
            shader: 'hillshading'
        }).addTo(map); */

      /*   L.imageWebGLOverlay(exampleData.layers[0].data[0].url, DEFAULT_BOUNDS, {
            colormap: exampleData.layers[0].data[0].colormap
        }).addTo(map); */

        L.polyline([[0 ,0], [0, 30]], {color: 'red'}).addTo(map);
        L.polyline([[0 ,30], [30, 30]], {color: 'red'}).addTo(map);
        L.polyline([[30 ,30], [30, 0]], {color: 'red'}).addTo(map);
        L.polyline([[30 ,0], [0, 0]], {color: 'red'}).addTo(map);
        
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
                    newLayer = L.imageWebGLOverlay(url, bounds, colormap, {
                        ...layerData,
                        shader: layerData.shader,
                    });
                } else {
                    newLayer = L.imageOverlay(url, bounds, {
                        ...layerData,
                    });
                }
                break;
            }

            case 'tile': {
                if(colormap) {
                    newLayer = L.tileWebGLLayer(url, colormap, {
                        ...layerData,
                        shader: layerData.shader,
                    })
                } else {
                    newLayer = L.tileLayer(url, {
                        ...layerData
                    });
                }
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
                    
                    {
                        this.state.map && (
                            <Controls 
                                map={this.state.map}
                                {...this.state.controls}
                            />
                        )
                    }
                </div>
            </div>
        )
    }

}

NewLayeredMap.propTypes = {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string.isRequired,

    /**
     * The layers
     */
    layers: PropTypes.array,

    /**
     * Configuration for map controls
     */
    controls: PropTypes.object,

    /**
     * 
     */
    bounds: PropTypes.array,

    /**
     * 
     */
    minZoom: PropTypes.number,

    /**
     * 
     */
    crs: PropTypes.string,
}

export default NewLayeredMap;