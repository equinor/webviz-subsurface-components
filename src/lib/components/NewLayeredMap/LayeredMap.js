import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

// Leaflet
import L from 'leaflet';
import './layers/L.imageWebGLOverlay';
import './layers/L.tileWebGLLayer';
import DrawControls from './DrawControls';

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

class LayeredMap extends Component {

    static mapReferences = {};

    constructor(props) {
        super(props);
        
        this.state = {
            id: props.id,
            map: null,
            layers: props.layers || [],
            minZoom: props.minZoom || -5,
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
<<<<<<< HEAD

            }) 
            
=======
            })

>>>>>>> 77c9e7dc61734bad10168b56f7ba85fda3688829
            if(this.state.bounds) {
                map.fitBounds(this.state.bounds);
            }
        });

<<<<<<< HEAD
        const baseMap = this.addLayersToMap(map);


        // const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


        // var baseMap = {
        //     'Map' : baseLayer
        // };
=======
        LayeredMap.mapReferences[this.state.id] = map;
>>>>>>> 77c9e7dc61734bad10168b56f7ba85fda3688829

        // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);



        this.addCircle([40.7,-74.22655], {color: 'red', fillColor: '#f03', fillOpacity: 0.5, radius: 900000}, map);


        this.addPoylgon([            
            [50.742,-64.22055],
            [40.710,-54.22955],
            [30.703,-34.24655]],
            map);

        
        // L.tileWebGLLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

<<<<<<< HEAD



        const image_overlay = L.imageWebGLOverlay(exampleData.layers[0].data[0].url, DEFAULT_BOUNDS, {
=======
         L.imageWebGLOverlay(exampleData.layers[0].data[0].url, DEFAULT_BOUNDS, {
>>>>>>> 77c9e7dc61734bad10168b56f7ba85fda3688829
            colormap: exampleData.layers[0].data[0].colormap
        }).addTo(map);

        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        let layerMap = {};

        this.addLayerControl(map, layerMap);
        this.addToolbar(map);


        L.polyline([[0 ,0], [0, 30]], {color: 'red'}).addTo(map);
        L.polyline([[0 ,30], [30, 30]], {color: 'red'}).addTo(map);
        L.polyline([[30 ,30], [30, 0]], {color: 'red'}).addTo(map);
<<<<<<< HEAD

        L.polyline([[30 ,0], [0, 0]], {color: 'red'}).addTo(map);
        
    }

    addOverlay = (overlay, layerName, layerMap) => {
        layerMap[layerName] = overlay;
    }

    addLayer = (layer, layerName, layerMap) => {
        layerMap[layerName] = layer;
    }


    addLayerControl = (map, mapLayers) => {
        // L.control.layers(this.baseMaps, this.overlayMaps).addTo(this.map)
        L.control.layers(mapLayers).addTo(map);
    }
    // this.state.layers.forEach((layer) => {
    //     (layer.data || []).forEach(this.addLayerDataToMap)
    // }) 

    addLayersToMap = (map) => {
        let layerMap = {};
        this.state.layers.forEach(layer => {
            layerMap[layer.name] = this.addLayerDataToMap(layer.data);
        })
        console.log("layermap: " + layerMap)
        return layerMap;
=======
        L.polyline([[30 ,0], [0, 0]], {color: 'red'}).addTo(map);

        this.setEvents(map);
>>>>>>> 77c9e7dc61734bad10168b56f7ba85fda3688829
        

    }

<<<<<<< HEAD
    // if it's a polygon, a line or a circle, add to the same layer
=======
    setEvents = (map) => {
        map.on('zoomanim', e => {
            this.props.syncedMaps.map(id => {
                // e.zoom provides zoom level after zoom unlike getZoom()
                if (
                    e.zoom !== LayeredMap.mapReferences[id].getZoom()
                ) {
                    LayeredMap.mapReferences[id].setView(
                        e.center,
                        e.zoom
                    )
                }
            })
        })
        
        map.on('move', e => {
            // Only react if move event is from a real user interaction
            // (originalEvent is undefined if viewport is programatically changed).
            this.props.syncedMaps.map(id => {
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

>>>>>>> 77c9e7dc61734bad10168b56f7ba85fda3688829
    addLayerDataToMap = (layerData) => {
        console.log("data: " + layerData.type)
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
                    console.log("image " + newLayer)
                    newLayer = L.imageWebGLOverlay(url, bounds, {
                        colormap: colormap,
                        /* CRS: L.CRS.Simple, */
                    });
                console.log("image layer " + newLayer)

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
        console.log("layer " + newLayer)
        if(newLayer) {
            newLayer.addTo(this.state.map);
        }
        return newLayer;
        // return [url, bounds, colormap];
    }

    addPoylgon(coordinateArray, map) {
            L.polygon(coordinateArray).addTo(map)
    }

    addCircle(c, properties, map) {
        L.circle(c, properties).addTo(map)
    }


    addToolbar(map) {
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        const drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems
            }
        });
        map.addControl(drawControl);
    }


<<<<<<< HEAD
    render() {
=======
    render() {        
>>>>>>> 77c9e7dc61734bad10168b56f7ba85fda3688829
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

LayeredMap.propTypes = {
    layers: PropTypes.array,

    id: PropTypes.string,
    
    syncedMaps: PropTypes.array,
}

export default LayeredMap;