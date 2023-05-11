/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import React, { Component } from "react";
import PropTypes from "prop-types";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import Context from "../../../utils/context";

import { getShapeType } from "../../../utils/leaflet";

// work around broken icons when using webpack, see https://github.com/PaulLeCam/react-leaflet/issues/255

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

/**  Leaflet-draw:edit event does not return marker type.
 *    Helper function to find marker type.
 *    https://stackoverflow.com/questions/18014907/leaflet-draw-retrieve-layer-type-on-drawedited-event
 **/

class DrawControls extends Component {
    constructor(props) {
        super(props);
        this.state = {
            drawControl: null,
        };

        this.syncDrawingsRef = React.createRef();
    }

    componentDidMount() {
        this.createDrawControl();
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.drawPolygon !== prevProps.drawPolygon ||
            this.props.drawPolyline !== prevProps.drawPolyline ||
            this.props.drawMarker !== prevProps.drawMarker
        ) {
            this.props.map.removeControl(this.state.drawControl);
            this.createDrawControl();
        }

        // Make sure to update the props.syncDrawings reference
        this.syncDrawingsRef.current = this.props.syncDrawings;
    }

    removeLayers(layerType, featureGroup) {
        const layerContainer = featureGroup.options.edit.featureGroup;
        const layers = layerContainer._layers;
        const layer_ids = Object.keys(layers);
        for (let i = 0; i < layer_ids.length - 1; i++) {
            const layer = layers[layer_ids[i]];
            if (getShapeType(layer) === layerType) {
                layerContainer.removeLayer(layer._leaflet_id);
            }
        }
    }

    createDrawControl = () => {
        const drawControl = new L.Control.Draw({
            position: this.props.position,
            edit: {
                featureGroup: this.context.drawLayer,
            },
            draw: {
                circlemarker: false,
                rectangle: this.props.drawRectangle,
                circle: this.props.drawCircle,
                polygon: this.props.drawPolygon,
                marker: this.props.drawMarker,
                polyline: this.props.drawPolyline,
            },
        });

        this.setState({ drawControl: drawControl }, () => {
            this.addCircleMarker(this.props.map);
            this.addToolbar(this.props.map);
        });
    };

    addToolbar = (map) => {
        map.on(L.Draw.Event.CREATED, (e) => {
            const syncDrawings = this.syncDrawingsRef.current || false;

            const type = e.layerType;
            const layer = e.layer;
            this.context.drawLayer.addLayer(layer);
            syncDrawings
                ? this.context.syncedDrawLayerDelete(type)
                : this.context.drawLayerDelete(type);
            const newLayer = { type: type };

            switch (type) {
                case "polyline": {
                    const coords = layer._latlngs.map((p) => {
                        return [p.lat, p.lng];
                    });
                    newLayer["positions"] = coords;
                    this.props.lineCoords(coords);
                    this.removeLayers("polyline", this.state.drawControl);
                    break;
                }
                case "polygon": {
                    const coords = layer._latlngs[0].map((p) => {
                        return [p.lat, p.lng];
                    });
                    newLayer["positions"] = coords;
                    this.props.polygonCoords(coords);
                    this.removeLayers("polygon", this.state.drawControl);
                    break;
                }

                case "marker": {
                    newLayer["position"] = [
                        layer._latlng.lat,
                        layer._latlng.lng,
                    ];
                    this.props.markerCoords([
                        layer._latlng.lat,
                        layer._latlng.lng,
                    ]);
                    this.removeLayers("marker", this.state.drawControl);
                    break;
                }
            }
            const d = new Date();
            newLayer["creationTime"] = d.getTime();

            syncDrawings
                ? this.context.syncedDrawLayerAdd([newLayer])
                : this.context.drawLayerAdd([newLayer]);
        });

        map.on(L.Draw.Event.EDITED, (e) => {
            const syncDrawings = this.syncDrawingsRef.current || false;

            const newLayers = [];

            e.layers.eachLayer((layer) => {
                const layerType = getShapeType(layer);
                syncDrawings
                    ? this.context.syncedDrawLayerDelete([layerType])
                    : this.context.drawLayerDelete([layerType]);
                const editedLayer = { type: layerType };
                switch (layerType) {
                    case "polyline": {
                        const coords = layer._latlngs.map((p) => {
                            return [p.lat, p.lng];
                        });
                        editedLayer["positions"] = coords;
                        this.props.lineCoords(coords);
                        break;
                    }

                    case "polygon": {
                        const coords = layer._latlngs[0].map((p) => {
                            return [p.lat, p.lng];
                        });
                        editedLayer["positions"] = coords;
                        this.props.polygonCoords(coords);
                        break;
                    }
                    case "marker":
                        editedLayer["position"] = [
                            layer._latlng.lat,
                            layer._latlng.lng,
                        ];
                        this.props.markerCoords([
                            layer._latlng.lat,
                            layer._latlng.lng,
                        ]);
                        break;

                    case "circleMarker":
                        editedLayer["center"] = [
                            layer._latlng.lat,
                            layer._latlng.lng,
                        ];
                        break;
                }
                const d = new Date();
                editedLayer["creationTime"] = d.getTime();
                newLayers.push(editedLayer);
            });
            syncDrawings
                ? this.context.syncedDrawLayerAdd(newLayers)
                : this.context.drawLayerAdd(newLayers);
            this.context.setMode(null);
        });

        map.on(L.Draw.Event.DELETED, (e) => {
            const syncDrawings = this.syncDrawingsRef.current || false;

            const deletedLayers = e.layers
                .getLayers()
                .map((layer) => getShapeType(layer));
            syncDrawings
                ? this.context.syncedDrawLayerDelete(deletedLayers, true)
                : this.context.drawLayerDelete(deletedLayers);
            this.context.setMode(null);
        });

        map.on("draw:editstart", () => {
            this.context.setMode("editing");
        });

        map.on("draw:deletestart", () => {
            this.context.setMode("editing");
        });

        map.addControl(this.state.drawControl);
    };

    addCircleMarker = (map) => {
        map.on("mouseup", (e) => {
            const syncDrawings = this.syncDrawingsRef.current || false;

            const d = new Date();
            const circleMarker = {
                type: "circleMarker",
                creationTime: d.getTime(),
                center: [e.latlng.lat, e.latlng.lng],
                color: "red",
                radius: 4,
            };
            if (this.context.mode !== "editing") {
                this.context.drawLayer.addLayer(
                    L.circleMarker(circleMarker.center, circleMarker)
                );
                this.removeLayers("circleMarker", this.state.drawControl);
                if (syncDrawings) {
                    this.context.syncedDrawLayerDelete(["circleMarker"]);
                    this.context.syncedDrawLayerAdd([circleMarker]);
                } else {
                    this.context.drawLayerDelete(["circleMarker"]);
                    this.context.drawLayerAdd([circleMarker]);
                }
            }
        });
    };

    render() {
        return null;
    }
}
DrawControls.contextType = Context;

DrawControls.defaultProps = {
    drawMarker: true,
    drawPolygon: true,
    drawPolyline: true,
    drawCircle: false,
    drawRectanlge: false,
    position: "topright",
};

DrawControls.propTypes = {
    map: PropTypes.object.isRequired,

    position: PropTypes.string,
    /* Show marker button*/
    drawMarker: PropTypes.bool,

    drawCircle: PropTypes.bool,

    drawRectangle: PropTypes.bool,

    /* Show polygon button*/
    drawPolygon: PropTypes.bool,

    /* Show polyline button*/
    drawPolyline: PropTypes.bool,

    /* Function to emit marker coordinates to dash */
    markerCoords: PropTypes.func,

    /* Function to emit polyline coordinates to dash */
    lineCoords: PropTypes.func,

    /* Function to emit polygon coordinates to dash */
    polygonCoords: PropTypes.func,

    /* Boolean to toggle sync drawing */
    syncDrawings: PropTypes.bool,
};

export default DrawControls;
