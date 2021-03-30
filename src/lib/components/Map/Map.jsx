/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import React, { Component } from "react";
import PropTypes from "prop-types";
import FlowMap from "./utils/flow_map";
import Map2D from "./utils/map2d";

const getIndexies = (layers) => {
    const index = {};
    layers.forEach((kLayer) => {
        kLayer.forEach(({ k, i, j, ...layer }) => {
            if (!index[k]) {
                index[k] = {};
            }
            if (!index[k][i]) {
                index[k][i] = {};
            }
            if (!index[k][i][j]) {
                index[k][i][j] = {};
                index[k][i][j]["FLOWI+"] = layer["FLOWI+"];
                index[k][i][j]["FLOWJ+"] = layer["FLOWJ+"];
            }
        });
    });
    return index;
};

const addNegativeFlow = ({ layers, indexies }) =>
    layers.map((kLayer) =>
        kLayer.map(({ i, j, k, ...layer }) => {
            let FLOWInegative = 0;
            let FLOWJnegative = 0;
            if (
                indexies[k][i - 1] &&
                indexies[k][i - 1][j] &&
                typeof indexies[k][i - 1][j]["FLOWI+"] !== "undefined"
            ) {
                FLOWInegative = indexies[k][i - 1][j]["FLOWI+"];
            }
            if (
                indexies[k][i][j - 1] &&
                typeof indexies[k][i][j - 1]["FLOWJ+"] !== "undefined"
            ) {
                FLOWJnegative = indexies[k][i][j - 1]["FLOWJ+"];
            }
            return {
                ...layer,
                k,
                i,
                j,
                "FLOWI-": FLOWInegative,
                "FLOWJ-": FLOWJnegative,
            };
        })
    );

export function makeFlowLayers(data) {
    const layers = [];

    const coord_scale = data.linearscales.coord[0];
    const xmin = data.linearscales.coord[1];
    const ymin = data.linearscales.coord[2];

    const val_scale = data.linearscales.value[0];
    const val_min = data.linearscales.value[1];

    const flow_scale = data.linearscales.flow[0];
    const flow_min = data.linearscales.flow[1];

    data.values.forEach((values) => {
        const kValue = values[2];
        if (!layers[kValue]) {
            layers[kValue] = [];
        }
        layers[kValue].push({
            i: values[0],
            j: values[1],
            k: values[2],
            points: [
                [
                    values[3] / coord_scale + xmin,
                    values[7] / coord_scale + ymin,
                ],
                [
                    values[4] / coord_scale + xmin,
                    values[8] / coord_scale + ymin,
                ],
                [
                    values[5] / coord_scale + xmin,
                    values[9] / coord_scale + ymin,
                ],
                [
                    values[6] / coord_scale + xmin,
                    values[10] / coord_scale + ymin,
                ],
            ],
            value: values[11] / val_scale + val_min,
            "FLOWI+": values[12] / flow_scale + flow_min,
            "FLOWJ+": values[13] / flow_scale + flow_min,
        });
    });

    const indexies = getIndexies(layers);
    return addNegativeFlow({ layers, indexies });
}

export const make2DLayers = (data) => {
    const layers = [];

    const coord_scale = data.linearscales.coord[0];
    const xmin = data.linearscales.coord[1];
    const ymin = data.linearscales.coord[2];

    const val_scale = data.linearscales.value[0];
    const val_min = data.linearscales.value[1];

    data.values.forEach((values) => {
        const kValue = values[2];
        if (!layers[kValue]) {
            layers[kValue] = [];
        }
        layers[kValue].push({
            i: values[0],
            j: values[1],
            k: values[2],
            points: [
                [
                    values[3] / coord_scale + xmin,
                    values[7] / coord_scale + ymin,
                ],
                [
                    values[4] / coord_scale + xmin,
                    values[8] / coord_scale + ymin,
                ],
                [
                    values[5] / coord_scale + xmin,
                    values[9] / coord_scale + ymin,
                ],
                [
                    values[6] / coord_scale + xmin,
                    values[10] / coord_scale + ymin,
                ],
            ],
            value: values[11] / val_scale + val_min,
        });
    });
    return layers;
};

const initFlowMap = ({
    canvasSelector,
    elementSelector,
    data,
    height,
    layerNames,
}) => {
    const layers = makeFlowLayers(data);
    const map = new FlowMap({
        canvasSelector,
        elementSelector,
        layers,
        layerNames,
        height,
    });
    map.init();
};

const init2DMap = ({ elementSelector, data, height, layerNames }) => {
    const layers = make2DLayers(data);
    const map = new Map2D({
        elementSelector,
        layers,
        layerNames,
        height,
    });
    map.init();
};

const parseData = (data) =>
    typeof data === "string" ? JSON.parse(data) : data;

const shouldRenderFlowMap = (data) => "flow" in data.linearscales;

class Map extends Component {
    constructor(props) {
        super(props);
        this.canvas = null;
        this.canvasId = `canvas-${props.id}`;
        this.elementId = `container-${props.id}`;
    }

    componentDidMount() {
        if (this.canvas) {
            const { data, height, layerNames } = this.props;
            const parsedData = parseData(data);
            const isFlowMap = shouldRenderFlowMap(parsedData);
            const canvasSelector = `#${this.canvasId}`;
            const elementSelector = `#${this.elementId}`;
            if (isFlowMap) {
                initFlowMap({
                    canvasSelector,
                    elementSelector,
                    data: parsedData,
                    height,
                    layerNames,
                });
            } else {
                init2DMap({
                    elementSelector,
                    data: parsedData,
                    height,
                    layerNames,
                });
            }
        }
    }

    render() {
        const { height } = this.props;
        return (
            <div
                style={{
                    height: `${height}px`,
                }}
            >
                <div id={this.elementId}>
                    <canvas
                        id={this.canvasId}
                        ref={(ref) => {
                            this.canvas = ref;
                        }}
                        style={{
                            pointerEvents: "none",
                            position: "absolute",
                            zIndex: "1",
                        }}
                    />
                </div>
            </div>
        );
    }
}

Map.defaultProps = {
    height: 800,
    layerNames: [],
};

Map.propTypes = {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string.isRequired,
    /**
     * The data the Map component should render (JSON format).
     */
    data: PropTypes.object.isRequired,
    /**
     * The height of the Map component
     */
    height: PropTypes.number,
    /**
     * The name of individual layers
     */
    layerNames: PropTypes.arrayOf(PropTypes.string),
};

export default Map;
