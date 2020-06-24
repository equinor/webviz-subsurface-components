import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

// Leaflet
import L from 'leaflet';
import './layers/L.imageWebGLOverlay';
import './layers/L.tileWebGLLayer';

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

class LayeredMap extends Component {

    static mapReferences = {};

    static getMR = () => {
        return this.mapReferences
    }

    constructor(props) {
        this.state = {
            id: props.id,
            syncedMaps: props.syncedMaps,
            map: null,
            layers: props.layers || [],
            minZoom: props.minZoom || -5,
            maxZoom: props.maxZoom || 15,
            zoom: props.zoom || 1,
            crs: stringToCRS(props.crs),
            center: props.center || [0, 0],
            bounds: props.bounds,
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
            if(this.state.bounds) {
                map.fitBounds(this.state.bounds);
            }
        });

        LayeredMap.mapReferences[this.state.id] = map;


        // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        // L.tileWebGLLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        L.imageWebGLOverlay(exampleData.layers[0].data[0].url, DEFAULT_BOUNDS, {
            colormap: exampleData.layers[0].data[0].colormap
        }).addTo(map);

        L.polyline([[0 ,0], [0, 30]], {color: 'red'}).addTo(map);
        L.polyline([[0 ,30], [30, 30]], {color: 'red'}).addTo(map);
        L.polyline([[30 ,30], [30, 0]], {color: 'red'}).addTo(map);
        L.polyline([[30 ,0], [0, 0]], {color: 'red'}).addTo(map);


        this.setEvents(map);
        console.log("This map's ID: ",this.state.id, "current references: ", LayeredMap.mapReferences);
        
    }

    // TODO: Fix issue with maps changing eachother at the same time
    setEvents = (map) => {
        map.on('zoomanim', e => {
            this.state.syncedMaps.map(id => {
                if (
                    map.getZoom() !== LayeredMap.mapReferences[id].getZoom()
                ) {
                    LayeredMap.mapReferences[id].setView(
                        map.getCenter(),
                        map.getZoom()
                    )
                    console.log("this is ", this.state.id, " changing zoom of ", id)
                }
            })
            

        })
        
        map.on('move', e => {
            /* console.log("Zoomend => current zoomlevel: ", map.getZoom());
            console.log("Zoomend => current center: ", map.getCenter()); */
            this.state.syncedMaps.map(id => {
                if (
                    typeof e.originalEvent !== "undefined"
                ) {
                    LayeredMap.mapReferences[id].setView(
                        e.target.getCenter()
                    )
                }
                
            })
            

        })
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
                        /* CRS: L.CRS.Simple, */
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

    // TODO: Fiks dette 
    setZoom = (zoom) => {
        // this.state.map.setZoom(zoom);
        console.log("trying to zoom");
        console.log(this.state.map.getZoom())
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

    id: PropTypes.string,
    
    syncedMaps: PropTypes.array,
}

export default LayeredMap;