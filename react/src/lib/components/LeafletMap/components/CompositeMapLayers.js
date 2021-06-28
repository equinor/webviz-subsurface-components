/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import { Component } from "react";
import PropTypes from "prop-types";
import Context from "../context";

// Leaflet
import L from "leaflet";
import "../layers/L.imageWebGLOverlay";
import "../layers/L.tileWebGLLayer";

// Utils
import {
    makePolyline,
    makePolygon,
    makeCircle,
    makeMarker,
    makeCircleMarker,
    addImage,
    addTile,
} from "../utils/leaflet";

// Helper functions
const yx = ([x, y]) => {
    return [y, x];
};

// Constants
const DEFAULT_BOUNDS = [
    [0, 0],
    [30, 30],
];

class CompositeMapLayers extends Component {
    constructor(props) {
        super(props);

        this.layerControl = null;
        this.layers = {};
        this.baseLayersById = {}; // { [baseLayerId]: true }
    }

    componentDidMount() {
        const layerControl = L.control.layers([]).addTo(this.props.map);
        this.layerControl = layerControl;
        this.createMultipleLayers();
        this.updateUponBaseMapChange();
    }

    updateLayer = (curLayer, newLayer) => {
        const focusedImageLayer = this.context.focusedImageLayer || {};
        const imageLayer = curLayer.getLayers()[0];

        switch (newLayer.data[0].type) {
            case "image":
                imageLayer.updateOptions({
                    ...newLayer.data[0],
                });

                if (focusedImageLayer._leaflet_id === imageLayer._leaflet_id) {
                    this.setFocusedImageLayer(curLayer.getLayers()[0]);
                }
                break;

            case "tile":
                curLayer.getLayers()[0].updateOptions({
                    ...newLayer.data[0],
                });
                break;
        }
    };

    componentDidUpdate(prevProps) {
        this.reSyncDrawLayer();
        if (prevProps.layers !== this.props.layers) {
            if (
                this.props.updateMode === "replace" ||
                prevProps.layers.length === 0
            ) {
                this.removeAllLayers();
                this.createMultipleLayers();
            } else {
                const layers = (this.props.layers || []).filter(
                    (layer) => layer.id
                );
                for (const propLayerData of layers) {
                    switch (propLayerData.action) {
                        case "update": {
                            const stateLayer = this.layers[propLayerData.id];
                            if (stateLayer) {
                                this.updateLayer(stateLayer, propLayerData);
                            }
                            break;
                        }

                        case "delete":
                            if (this.layers[propLayerData.id]) {
                                const stateLayer =
                                    this.layers[propLayerData.id];
                                stateLayer.remove();
                                this.layerControl.removeLayer(stateLayer);
                                this.removeLayerFromState(propLayerData.id);
                                delete this.baseLayersById[propLayerData.id];
                            }
                            break;

                        case "add":
                            if (!this.layers[propLayerData.id]) {
                                this.createLayerGroup(propLayerData);
                            }
                            break;

                        default:
                            break;
                    }
                }
            }
        }
    }

    componentWillUnmount() {
        const map = this.props.map;
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });
    }

    removeAllLayers = () => {
        const map = this.props.map;
        this.context.drawLayerDelete("all");
        Object.values(this.layers).forEach((layer) => {
            this.layerControl.removeLayer(layer);
        });

        // TODO: check if the last invisible layer is duplicated if we don't remove it
        // For some reason there exists at least one layer which is not in state
        map.eachLayer((layer) => {
            layer.remove();
        });
        this.layers = {};

        this.baseLayersById = {}; // Reset
    };

    // Assumes that coordinate data comes in on the format of (y,x) by default
    addItemToLayer(item, layerGroup, swapXY = true) {
        let newItem = null;
        switch (item.type) {
            case "polyline":
                newItem = makePolyline(item, swapXY, this.props.setProps);
                break;

            case "polygon":
                newItem = makePolygon(item, swapXY, this.props.setProps);
                break;

            case "circle":
                newItem = makeCircle(item, swapXY, this.props.setProps);
                break;

            case "circleMarker":
                newItem = makeCircleMarker(item, swapXY);
                break;

            case "marker":
                newItem = makeMarker(item, swapXY, this.props.setProps);
                break;

            case "image": {
                const imageLayer = addImage(item, swapXY);
                newItem = imageLayer;
                break;
            }

            case "tile":
                newItem = addTile(item, swapXY);
                break;

            default:
                break; // add error message here?
        }
        layerGroup.addLayer(newItem);
        return newItem;
    }

    updateUponBaseMapChange = () => {
        this.props.map.on("baselayerchange", (e) => {
            const layer = Object.values(e.layer._layers)[0];
            this.setFocusedImageLayer(layer);

            const bounds = layer.getBounds ? layer.getBounds() : DEFAULT_BOUNDS;
            this.props.map.fitBounds(bounds);
        });
    };

    removeLayerFromState = (id) => {
        delete this.layers[id];

        if (this.baseLayersById[id]) {
            delete this.baseLayersById[id];
        }
    };

    createMultipleLayers() {
        const layers = (this.props.layers || []).filter(
            (layer) => layer.action !== "delete"
        );
        for (const layer of layers) {
            this.createLayerGroup(layer);
        }
        this.addDrawLayerToMap();
    }

    createLayerGroup = (layer) => {
        if (this.layers[layer.id]) {
            return;
        }
        const layerGroup = L.featureGroup();
        this.layers[layer.id] = layerGroup;

        // Makes sure that the correct information is displayed when first loading the map
        const checkedAsImageLayer =
            layer.checked &&
            layer.baseLayer &&
            layer.data.length > 0 &&
            layer.data[0].type === "image"
                ? true
                : false;

        const activeLayer = this.getActiveBaseLayer();

        // Adds object to a layer
        for (const item of layer.data) {
            const createdLayer = this.addItemToLayer(item, layerGroup);
            if (checkedAsImageLayer && !activeLayer) {
                this.setFocusedImageLayer(createdLayer);
            }
        }

        if (layer.checked && !activeLayer) {
            layerGroup.addTo(this.props.map);
        } else if (layer.checked && !layer.baseLayer) {
            // Always add overlayLayer if it is checked
            layerGroup.addTo(this.props.map);
        }

        // adds layers to the layerControl
        if (layer.baseLayer) {
            this.layerControl.addBaseLayer(layerGroup, layer.name);
            this.baseLayersById[layer.id] = true;

            // Fits the map bounds if layer is a base layer
            // TODO: improve bounds optimization?
            if (layer.data && layer.data.length > 0 && !activeLayer) {
                const bounds = layer.data[0].bounds
                    ? layer.data[0].bounds.map((xy) => yx(xy))
                    : DEFAULT_BOUNDS;
                this.props.map.fitBounds(bounds);
            }
        } else {
            this.layerControl.addOverlay(layerGroup, layer.name);
        }
    };

    addDrawLayerToMap = () => {
        this.layers.drawLayer = this.context.drawLayer;

        this.context.drawLayer.addTo(this.props.map);
        this.layerControl.addOverlay(this.context.drawLayer, "Drawings");
    };

    setFocusedImageLayer = (layer) => {
        const updateFunc = this.context.setFocusedImageLayer;
        if (updateFunc) {
            updateFunc(layer);
        }
    };

    reSyncDrawLayer = () => {
        /**
         * For some reason moving the marker while using multiple maps in dash
         * throws an error in leaflet. Everything works fine as long as this is
         * surrounded in a try catch
         */

        try {
            this.context.drawLayer.clearLayers();
        } catch (error) {
            null;
        }

        const itemsToDraw = {};

        for (const item of this.context.syncedDrawLayer.data) {
            if (this.props.syncedMaps.includes(item.creatorId)) {
                this.props.syncDrawings
                    ? this.addItemToLayer(item, this.context.drawLayer, false)
                    : (itemsToDraw[item.type] = item);
            }
        }

        // TODO: See if we can optimize the switch between drawing from the synced drawlayer and from state
        if (!this.props.syncDrawings) {
            for (const item of this.context.drawLayerData) {
                if (
                    !itemsToDraw[item.type] ||
                    itemsToDraw[item.type].creationTime < item.creationTime
                ) {
                    this.addItemToLayer(item, this.context.drawLayer, false);
                    delete itemsToDraw[item.type];
                }
            }
        }

        Object.values(itemsToDraw).forEach((item) => {
            this.addItemToLayer(item, this.context.drawLayer, false);
        });
    };

    getActiveBaseLayer() {
        const baseLayerIds = Object.keys(this.baseLayersById || {});
        const layers = baseLayerIds
            .map((id) => this.layers[id])
            .filter((l) => l);
        return layers.find((layer) => this.props.map.hasLayer(layer));
    }

    render() {
        return null;
    }
}
CompositeMapLayers.contextType = Context;

CompositeMapLayers.propTypes = {
    map: PropTypes.object.isRequired,

    updateMode: PropTypes.string,

    setProps: PropTypes.func,

    syncedMaps: PropTypes.array,

    syncDrawings: PropTypes.bool,

    /* Data for one single layer. See parent component LayeredMap for documentation.
     */
    layers: PropTypes.array,

    /* Coordinates for selected polyline*/
    lineCoords: PropTypes.func,

    /* Coordinates for selected polygon*/
    polygonCoords: PropTypes.func,
};

export default CompositeMapLayers;
