import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

// Leaflet
import L from 'leaflet';
import './layers/L.imageWebGLOverlay';
import './layers/L.tileWebGLLayer';

// Components
import Controls from './components/Controls';
import CompositeMapLayers from './components/CompositeMapLayers';
import Context from './context';

// Assets
import exampleData from '../../../demo/example-data/new-layered-map.json';

// Utils
import { onSizeChange } from './utils/element';

const stringToCRS = (crsString) => {
    switch(crsString) {
        case 'earth': {
            return L.CRS.EPSG3857;
        }

        default:
            return L.CRS.Simple;
    }
}

class NewLayeredMap extends Component {

    static mapReferences = {};
    static syncedDrawLayer = {
        data: [

        ]
    };

    constructor(props) {
        super(props);
        const drawLayer = new L.featureGroup();
        this.state = {
            id: props.id,
            map: null,
            layers: props.layers || [],
            minZoom: props.minZoom || 1,
            maxZoom: props.maxZoom || 15,
            zoom: props.zoom || 1,
            crs: stringToCRS(props.crs),
            // center: [432205, 6475078],
            center: props.center || [0, 0],
            defaultBounds: props.defaultBounds,
            controls: props.controls || {},
            drawLayer: drawLayer,
            drawLayerData: [],
            mode: null,

            // The imageLayer in focus - for calculating z value and showing colormap for
            focusedImageLayer: null,
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
            attributionControl: false,
            zoomAnimation: true,
        });
        this.setState({map: map});
        NewLayeredMap.mapReferences[this.state.id] = this;
        this.setEvents(map);

        // If the width or height of the map changes, leaflet need to recalculate its dimensions
        this.onSizeChange = onSizeChange(this.mapEl, () => {
            map.invalidateSize();
        })
    }

    componentDidUpdate() {
        
    }

    componentWillMount() {
        // Clear onSizeChange listener
        this.onSizeChange && this.onSizeChange();
    }


    setEvents = (map) => {

        map.on('zoomanim', e => {
            
            (this.props.syncedMaps || []).forEach(id => {
                if(!NewLayeredMap.mapReferences[id] || id === this.state.id) {
                    return;
                }

                // e.zoom provides zoom level after zoom unlike getZoom()
                if (
                    e.zoom !== NewLayeredMap.mapReferences[id].getMap().getZoom()
                ) {
                    NewLayeredMap.mapReferences[id].getMap().setView(
                        e.center,
                        e.zoom
                    )
                }
            })
        })
        
        map.on('move', e => {
            // Only react if move event is from a real user interaction
            // (originalEvent is undefined if viewport is programatically changed).
            (this.props.syncedMaps || []).forEach(id => {
                if(!NewLayeredMap.mapReferences[id] || id === this.state.id) {
                    return;
                }

                if (
                    typeof e.originalEvent !== "undefined"
                ) {
                    NewLayeredMap.mapReferences[id].getMap().setView(
                        e.target.getCenter()
                    )
                }
                
            })
        })
    }

    getMap = () => {
        return this.state.map;
    }

    setPropsExist = (value) => {
        if(!this.props.setProps) {
            console.log(value);
        } else {
            this.props.setProps(value);
        }
    }

    drawLayerAdd = (newLayers) => {
        this.setState(prevState => ({
            drawLayerData: [...prevState.drawLayerData, ...newLayers]
        }))
    }

    drawLayerDelete = (layerTypes) => {
        if (layerTypes === "all") {
            this.setState({drawLayerData: []});
            return
        }
        const layers = this.state.drawLayerData.filter((drawing) => {
            return !layerTypes.includes(drawing.type);
        })
        if (layers !== this.state.layers) {
            this.setState({drawLayerData: layers});
        }    
    }

    syncedDrawLayerAdd = (newLayers) => {
        for (const layer of newLayers) {
            layer["creatorId"] = this.state.id;
            NewLayeredMap.syncedDrawLayer.data.push(layer);
        }
        this.redrawAllSyncedMaps();
    }

    syncedDrawLayerDelete = (layerTypes, shouldRedraw) => {
        const syncedMaps = [...this.props.syncedMaps, this.state.id];
        NewLayeredMap.syncedDrawLayer.data = NewLayeredMap.syncedDrawLayer.data.filter((drawing) => {
            return !syncedMaps.includes(drawing.creatorId) || !layerTypes.includes(drawing.type);
        })
        if (shouldRedraw) {
            this.redrawAllSyncedMaps();
        }
    }

    redrawAllSyncedMaps = () => {
        if (this.props.syncDrawings) {
            for (const id of this.props.syncedMaps || []) {
                if (id !== this.state.id) {
                    const otherMap = NewLayeredMap.mapReferences[id];
                    otherMap && otherMap.forceUpdate && otherMap.forceUpdate(); 
                }
            }
        }
        // When using the component in dash with multiple maps drawing won't work
        // If not added to the map through the reSyncDrawLayer due to how setProps works
        this.forceUpdate();
    }

    /**
     * @param {HTMLCanvasElement} onScreenCanvas
     */
    setFocucedImageLayer = (layer) => {
        this.setState({
            focusedImageLayer: layer,
        })
    }

    /**
     * @param {String} mode
     * can be "editing" or null
     */
    setMode = newMode => {
        this.setState({
            mode: newMode
        })
    }
    
    render() {   
        
        return (
            <div style={{height: '100%', width: '100%'}}>
                <div
                    ref={el => this.mapEl = el} 
                    style={{height: '100%'}}>
                        <Context.Provider value={{
                                drawLayer: this.state.drawLayer,
                                drawLayerData: this.state.drawLayerData,
                                syncedDrawLayer: NewLayeredMap.syncedDrawLayer,
                                mode: this.state.mode,
                                setMode: this.setMode,
                                drawLayerAdd: this.drawLayerAdd,
                                drawLayerDelete: this.drawLayerDelete,
                                syncedDrawLayerAdd: this.syncedDrawLayerAdd,
                                syncedDrawLayerDelete: this.syncedDrawLayerDelete,
                                focusedImageLayer: this.state.focusedImageLayer,
                                setFocusedImageLayer: this.setFocucedImageLayer,
                            }}
                        >
                            {
                                this.state.map && (
                                        <Controls 
                                            setProps={this.setPropsExist}
                                            map={this.state.map}
                                            scaleY={this.props.scaleY}
                                            switch={this.props.switch}
                                            colorBar={this.props.colorBar}
                                            drawTools={this.props.drawTools}
                                            mouseCoords = {this.props.mouseCoords}
                                            syncDrawings={this.props.syncDrawings}
                                        />
                                )
                            }
                            {
                                this.state.map && (
                                    <CompositeMapLayers 
                                        layers={this.props.layers}
                                        map={this.state.map}
                                        syncedMaps={[...(this.props.syncedMaps || []), this.state.id]}
                                        syncDrawings={this.props.syncDrawings}
                                        updateMode={this.props.updateMode}
                                    />
                                )
                            }
                        </Context.Provider>
                </div>
            </div>
        )
    }

}
NewLayeredMap.contextType = Context;

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
     * For reacting to changes in controls
     */
    setProps: PropTypes.func,
    /**
     * Mouse properties configuration
     */
    mouseCoords: PropTypes.shape({
        position: PropTypes.string
    }),
    /**
     * ScaleY is a configuration for creating a slider for scaling the Y-axis.
     */
    scaleY: PropTypes.shape({
        scaleY: PropTypes.number,
        maxScaleY: PropTypes.number,
        minScaleY: PropTypes.number,
        position: PropTypes.string,
    }),

    /**
     * Switch is a configuration for creating a switch-toggle.
     */
    switch: PropTypes.shape({
        value: PropTypes.bool,
        disabled: PropTypes.bool,
        position: PropTypes.string,
        label: PropTypes.string,
    }),


    /**
     * DrawTools is a configuration for enabling drawing of polylines and areas.
     */
    drawTools: PropTypes.shape({
        drawMarker: PropTypes.bool,
        drawPolygon: PropTypes.bool,
        drawPolyline: PropTypes.bool,
        position: PropTypes.string,
    }),

    /**
     * ColorBar is a box that displays the colorScale.
     */
    colorBar: PropTypes.shape({
        position: PropTypes.string,
    }),

    center: PropTypes.array,
    /**
     * 
     */
    defaultBounds: PropTypes.array,

    /**
     * 
     */
    zoom: PropTypes.number,

    /**
     * 
     */
    minZoom: PropTypes.number,

    /**
     * 
     */
    maxZoom: PropTypes.number,

    /**
     * 
     */
    crs: PropTypes.string,

    /**
     * Ids of other LayeredMap instances that should be synced with this instance  
     */    
    syncedMaps: PropTypes.array,

    /**
     * Boolean deciding whether or not to sync drawings between maps  
     */
    syncDrawings: PropTypes.bool,

    /**
     * Allows to choose between replacing the layers or updating them
     */
    updateMode: PropTypes.string,

    /**
     * Dash provided prop that returns the coordinates of the edited or clicked polyline
     */
    polyline_points: PropTypes.array,

    /**
     * Dash provided prop that returns the coordinates of the edited or clicked polygon
     */
    polygon_points: PropTypes.array,

    /**
     * Dash provided prop that returns the coordinates of the edited or clicked marker
     */
    marker_point: PropTypes.array,

    /**
     * Map coordinates of a mouse click
     */
    click_position: PropTypes.array,   
}


export default NewLayeredMap;
