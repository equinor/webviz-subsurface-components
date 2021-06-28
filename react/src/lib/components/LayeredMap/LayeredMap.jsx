/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/* eslint no-inline-comments: 0 */
import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import "leaflet/dist/leaflet.css";
import { CRS } from "leaflet";
import {
    LayersControl,
    Map,
    ScaleControl,
    FeatureGroup,
    CircleMarker,
} from "react-leaflet";
import Switch from "./components/Switch.react";
import ValueInfoBox from "./components/ValueInfoBox.react";
import OptionalLayerControl from "./components/OptionalLayerControl.react";
import CompositeMapLayer from "./components/CompositeMapLayer.react";
import DrawControls from "./components/DrawControls.react";
import VerticalZoom from "./components/VerticalZoom.react";
import "./layered-map.css";

const { BaseLayer, Overlay } = LayersControl;
const yx = ([x, y]) => {
    return [y, x];
};

const _layeredmap_references = {};

class LayeredMap extends Component {
    constructor(props) {
        super(props);
        this.mapRef = React.createRef();
        this.state = {
            hillShading: this.props.hillShading,
            x: null,
            y: null,
            z: null,
        };
    }

    handleHillshadingChange() {
        this.setState({ hillShading: !this.state.hillShading });
    }

    calculateBounds() {
        const x_arr = [];
        const y_arr = [];
        if (this.props.layers.length === 0) {
            return [
                [0, 0],
                [1, 1],
            ];
        }
        this.props.layers.map((layer) => {
            layer.data.map((item) => {
                if (["polyline", "polygon"].includes(item.type)) {
                    item.positions.map((xy) => {
                        x_arr.push(xy[0]);
                        y_arr.push(xy[1]);
                    });
                } else if (item.type === "circle") {
                    x_arr.push(item.center[0] + item.radius);
                    x_arr.push(item.center[0] - item.radius);
                    y_arr.push(item.center[1] + item.radius);
                    y_arr.push(item.center[1] - item.radius);
                } else if (item.type === "image") {
                    x_arr.push(item.bounds[0][0]);
                    x_arr.push(item.bounds[1][0]);
                    y_arr.push(item.bounds[0][1]);
                    y_arr.push(item.bounds[1][1]);
                }
            });
        });

        return [
            [Math.min(...x_arr), Math.min(...y_arr)],
            [Math.max(...x_arr), Math.max(...y_arr)],
        ];
    }

    resetView() {
        const [[xmin, ymin], [xmax, ymax]] = this.calculateBounds();
        const center = [0.5 * (xmin + xmax), 0.5 * (ymin + ymax)];
        const width = this.mapRef.current.container.offsetWidth;
        const height = this.mapRef.current.container.offsetHeight;

        const initial_zoom = Math.min(
            Math.log2(height / (ymax - ymin)),
            Math.log2(width / (xmax - xmin))
        );

        this.mapRef.current.leafletElement.options.minZoom = initial_zoom - 2;
        this.mapRef.current.leafletElement.setView(yx(center), initial_zoom);
    }

    updateCircleMarkerPosition(x, y) {
        const Z_UPDATE_INTERVAL = 50; // milliseconds

        this.setState({
            x: x,
            y: y,
            z:
                "z_timestamp" in this.state &&
                Date.now() - this.state.z_timestamp < Z_UPDATE_INTERVAL
                    ? this.state.z
                    : null, // Nullify z value if more than specified interval since populated
        });
    }

    setEvents() {
        this.mapRef.current.leafletElement.on("zoomanim", (ev) => {
            this.props.sync_ids
                .filter((id) => id !== this.props.id)
                .map((id) => {
                    if (
                        _layeredmap_references[
                            id
                        ].mapRef.current.leafletElement.getZoom() !== ev.zoom
                    ) {
                        _layeredmap_references[
                            id
                        ].mapRef.current.leafletElement.setView(
                            ev.center,
                            ev.zoom
                        );
                    }
                });
        });

        this.mapRef.current.leafletElement.on("onlayeredmapclick", (ev) => {
            this.setState({ z: ev.z, z_timestamp: Date.now() });
        });

        this.mapRef.current.leafletElement.on("click", (ev) => {
            this.updateCircleMarkerPosition(ev.latlng.lng, ev.latlng.lat);
            this.props.sync_ids.map((id) => {
                _layeredmap_references[id].updateCircleMarkerPosition(
                    ev.latlng.lng,
                    ev.latlng.lat
                );
            });
        });

        this.mapRef.current.leafletElement.on("move", (ev) => {
            this.props.sync_ids
                .filter((id) => id !== this.props.id)
                .map((id) => {
                    // Only react if move event is from a real user interaction
                    // (originalEvent is undefined if viewport is programatically changed).
                    if (typeof ev.originalEvent !== "undefined") {
                        _layeredmap_references[
                            id
                        ].mapRef.current.leafletElement.setView(
                            ev.target.getCenter()
                        );
                    }
                });
        });
    }
    componentDidMount() {
        this.resetView();

        this.setEvents();

        _layeredmap_references[this.props.id] = this;
    }

    componentWillUnmount() {
        delete _layeredmap_references[this.props.id];
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.uirevision !== prevProps.uirevision ||
            (this.props.layers.length > 0 && prevProps.layers.length === 0)
        ) {
            this.resetView();
        }
    }

    render() {
        const {
            draw_toolbar_marker,
            draw_toolbar_polygon,
            draw_toolbar_polyline,
            setProps,
        } = this.props;
        const showDrawControls =
            draw_toolbar_marker || draw_toolbar_polygon || draw_toolbar_polyline
                ? true
                : false;
        const showHillshadingSwitch = this.props.layers.some((layer) =>
            layer.data.some((item) => item.allowHillshading)
        );

        const showLayersControl = this.props.layers.length > 1;

        const renderBaseLayer = (layer, key) => (
            <CompositeMapLayer
                layer={layer}
                key={key}
                hillShading={this.state.hillShading}
                lightDirection={this.props.lightDirection}
            />
        );

        const renderOverlay = (layer, key) => (
            <CompositeMapLayer
                layer={layer}
                key={key}
                hillShading={this.state.hillShading}
                lightDirection={this.props.lightDirection}
                lineCoords={(coords) => setProps({ polyline_points: coords })}
                polygonCoords={(coords) => setProps({ polygon_points: coords })}
            />
        );

        return (
            <Map
                id={this.props.id}
                style={{ zIndex: 0, height: this.props.height }}
                ref={this.mapRef}
                attributionControl={false}
                crs={CRS.Simple}
            >
                {this.props.showScaleY && (
                    <VerticalZoom
                        position="topleft"
                        scaleY={this.props.scaleY}
                        minScaleY={1}
                        maxScaleY={10}
                    />
                )}
                <ScaleControl
                    position="bottomright"
                    imperial={false}
                    metric={true}
                />
                <OptionalLayerControl showLayersControl={showLayersControl}>
                    {this.props.layers
                        .filter((layer) => layer.base_layer)
                        .map((layer) =>
                            showLayersControl ? (
                                <BaseLayer
                                    checked={layer.checked}
                                    name={layer.name}
                                    key={layer.name}
                                >
                                    {renderBaseLayer(layer)}
                                </BaseLayer>
                            ) : (
                                renderBaseLayer(layer, layer.name)
                            )
                        )}
                    {this.props.layers
                        .filter((layer) => !layer.base_layer)
                        .map((layer) =>
                            showLayersControl ? (
                                <Overlay
                                    checked={layer.checked}
                                    name={layer.name}
                                    key={layer.name}
                                >
                                    {renderOverlay(layer)}
                                </Overlay>
                            ) : (
                                renderOverlay(layer, layer.name)
                            )
                        )}
                </OptionalLayerControl>
                {showDrawControls && (
                    <FeatureGroup>
                        <DrawControls
                            drawMarker={draw_toolbar_marker}
                            drawPolygon={draw_toolbar_polygon}
                            drawPolyline={draw_toolbar_polyline}
                            lineCoords={(coords) =>
                                setProps({ polyline_points: coords })
                            }
                            markerCoords={(coords) =>
                                setProps({ marker_point: coords })
                            }
                            polygonCoords={(coords) =>
                                setProps({ polygon_points: coords })
                            }
                        />
                    </FeatureGroup>
                )}
                {showHillshadingSwitch && (
                    <Switch
                        position="bottomleft"
                        label="Hillshading"
                        checked={this.props.hillShading}
                        onChange={this.handleHillshadingChange.bind(this)}
                    />
                )}
                {this.state.x !== null && (
                    <Fragment>
                        <CircleMarker
                            center={[this.state.y, this.state.x]}
                            color="red"
                            radius={5}
                        />

                        <ValueInfoBox
                            position="bottomleft"
                            x={this.state.x}
                            y={this.state.y}
                            z={this.state.z}
                        />
                    </Fragment>
                )}
            </Map>
        );
    }
}

LayeredMap.defaultProps = {
    height: 800,
    sync_ids: [],
    hillShading: true,
    lightDirection: [1, 1, 1],
    scaleY: 1,
    showScaleY: false,
    draw_toolbar_marker: false,
    draw_toolbar_polygon: false,
    draw_toolbar_polyline: false,
    uirevision: "",
};

LayeredMap.propTypes = {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string.isRequired,

    /**
     * IDs of other LayeredMap components which should be updated with same zoom/pan
     * as in this one when the user changes zoom/pan in this component instance.
     * For convenience, you can include the same ID as this instance (it will be ignored).
     */
    sync_ids: PropTypes.array,

    /**
     * The initial scale of the y axis (relative to the x axis).
     * A value >1 increases the visual length of the y axis compared to the x axis.
     * Updating this property will override any interactively set y axis scale.
     * This property does not have any effect unless showScaleY is true.
     */
    scaleY: PropTypes.number,

    /**
     * If to show the vertical scale slider or not.
     */
    showScaleY: PropTypes.bool,

    /**
     * Height of the component
     */
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * Add button to draw a polyline
     */
    draw_toolbar_polyline: PropTypes.bool,

    /**
     * Add button to draw a polygon
     */
    draw_toolbar_polygon: PropTypes.bool,

    /**
     * Add button to draw a marker
     */
    draw_toolbar_marker: PropTypes.bool,

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
     * Light direction.
     */
    lightDirection: PropTypes.array,

    /**
     * Dash-assigned callback that should be called whenever any of the
     * properties change
     */
    setProps: PropTypes.func,

    /**
     * An array of different layers. Each layer is a dictionary with the following structure:
          {
           'name': 'Name of my layer',  // Name of the layer (appears in the map layer control)
           'base_layer': true,
           'checked': false, // If it should be checked initially (only one base layer can have this as True)
           'data': [ ... ] // A list of the different map components this layer consists of (see below for the allowed components)
          }

     * For overlay layers ('base_layer' == false), 'checked' can be tru for an arbitrary number of overlay layers.
     * For base layers maximum one layer should be checked.
     */
    layers: PropTypes.array,

    hillShading: PropTypes.bool,

    /**
     * A string to control if map bounds should be recalculated on prop change.
       Recalculation will occur if this string changes (or when the layers array property
       goes from zero to non-zero length).
     */
    uirevision: PropTypes.string,
};

export default LayeredMap;

/** Allowed map components:
*
* Polyline is a sequence of line segments:
*
*     {
*      'type': 'polyline',
*      'positions': [[x1, y1],
*                    [x2, y2],
*                    [x3, y3]],
*      'color': 'green',
*      'tooltip': 'This is a green fault line' // This one is optional.
*     }
*
* Polygon is a sequence of line segmens which in addition is filled. Same
* syntax as for polyline except 'type' is 'polygon'.
*
* A circle annotation:
*
*     {
*      'type': 'circle',
*      'center': [x1, y1],
*      'color': 'red',
*      'radius': 2,
*      'tooltip': 'This is a red circle' // This one is optional.
*     }
*
* An overlay image:
*
*     {
*      'type': 'image',
*      'url': either base64 encoding of the picture or a path to hosted image,
*      'colormap': optional - base64 encoding of a 256 x 1 picture representing the colormap
*      'bounds': [[xmin, ymin],  // The extent of the picture in the rendered map
*                 [xmax, ymax]]
       'allowHillshading': false  // optional - if the image is to have hill shading or not (false is default)
       'elevationScale': scale // optional - see ../private-components/layered-map-resources/ImageOverlayWebGL for definition
*     }
*/
