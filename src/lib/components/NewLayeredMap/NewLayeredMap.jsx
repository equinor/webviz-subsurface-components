import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

// Leaflet
import L from 'leaflet';
import './layers/L.imageWebGLOverlay';
import './layers/L.tileWebGLLayer';

// Components
import Controls from './components/Controls';
import CompositeMapLayers from './components/CompositeMapLayers'
import Context from './Context'

// Assets
import exampleData from '../../../demo/example-data/new-layered-map.json';

// Constants
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

// Contexts
// export const DrawLayerContext = React.createContext({drawLayer: "hi there"});
// console.log("DrawLayerContext in newlayeredmap", DrawLayerContext)

// TODO: make context work

// const DrawLayerContext = React.createContext({hi: "hi there fella"});

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
            center: props.center || [6475078, 432205],
            // center: props.center || [0, 0],
            bounds: props.bounds,
            controls: props.controls || {},
            drawLayer: drawLayer,

            // Used to make possible to display z-value
            focusedImageLayer: null,

            //Used for adding mouseposition in controls
            
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
        });

        this.setState({map: map});
        NewLayeredMap.mapReferences[this.state.id] = this;
        this.setEvents(map);
    }

    componentDidUpdate() {
        
    }


    setEvents = (map) => {

        map.on('zoomanim', e => {
            (this.props.syncedMaps || []).map(id => {
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
            (this.props.syncedMaps || []).map(id => {
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
        return this.state.map
    }

    setPropsExist = (value) => {
        if(!this.props.setProps) {
            console.log(value);
        } else {
            this.props.setProps(value);
        }
    }

    syncedDrawLayerAdd = (newLayer) => {
        NewLayeredMap.syncedDrawLayer.data.push(newLayer)
        // console.log("[ SDL ]: ", NewLayeredMap.syncedDrawLayer)
        this.render() // TODO: Replace with forceUpdate()
    }

    syncedDrawLayerDelete = (layerType) => {
        // console.log(layerType)
        NewLayeredMap.syncedDrawLayer.data = NewLayeredMap.syncedDrawLayer.data.filter((drawing) => {
            return drawing.type !== layerType;
        })
    }

    /**
     * @param {HTMLCanvasElement} onScreenCanvas
     */
    setFocucedImageLayer = (url, onScreenCanvas, minvalue, maxvalue) => {
        this.setState({
            focusedImageLayer: { url: url, canvas: onScreenCanvas, minvalue: minvalue, maxvalue: maxvalue}
        })
    }


    render() {   
        
        return (
            <div>
                <div
                    ref={el => this.mapEl = el} 
                    style={{height: '90vh'}}>
                        <Context.Provider value={{
                                drawLayer: this.state.drawLayer,
                                syncedDrawLayer: NewLayeredMap.syncedDrawLayer,
                                syncedDrawLayerAdd: this.syncedDrawLayerAdd,
                                syncedDrawLayerDelete: this.syncedDrawLayerDelete,

                                focusedImageLayer: this.state.focusedImageLayer,
                                setFocusedImageLayer: this.setFocucedImageLayer,
                            }}
                        >
                            {
                                this.state.map && (
                                        <Controls 
                                            setProps={this.setPropsExist} //coords [x,y,z]
                                            map={this.state.map}
                                            scaleY={this.props.scaleY}
                                            switch={this.props.switch}
                                            drawTools={this.props.drawTools}
                                        />
                                )
                            }
                            {
                                this.state.map && (
                                    <CompositeMapLayers 
                                        layers={this.props.layers}
                                        map={this.state.map}
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
     * Map coordinates of a mouse click
     */
    click_coords: PropTypes.array,
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

    /**
     * Ids of other LayeredMap instances that should be synced with this instance  
     */    
    syncedMaps: PropTypes.array,
}
export default NewLayeredMap;