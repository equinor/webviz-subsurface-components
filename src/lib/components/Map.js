import React, {Component} from 'react';
import PropTypes from 'prop-types';
import FlowMap from '../private_components/map/flow_map';
import Map2D from '../private_components/map/map2d';

const getIndexies = layers => {
    const index = {};
    layers.forEach(kLayer => {
        kLayer.forEach(({k, i, j, ...layer}) => {
            if (!index[k]) {
                index[k] = {};
            }
            if (!index[k][i]) {
                index[k][i] = {};
            }
            if (!index[k][i][j]) {
                index[k][i][j] = {};
                index[k][i][j]['FLOWI+'] = layer['FLOWI+'];
                index[k][i][j]['FLOWJ+'] = layer['FLOWJ+'];
            }
        });
    });
    return index;
};

const addNegativeFlow = ({layers, indexies}) =>
    layers.map(kLayer =>
        kLayer.map(({i, j, k, ...layer}) => {
            let FLOWInegative = 0;
            let FLOWJnegative = 0;
            if (
                indexies[k][i - 1] &&
                indexies[k][i - 1][j] &&
                indexies[k][i - 1][j]['FLOWI+'] !== undefined
            ) {
                FLOWInegative = indexies[k][i - 1][j]['FLOWI+'];
            }
            if (
                indexies[k][i][j - 1] &&
                indexies[k][i][j - 1]['FLOWJ+'] !== undefined
            ) {
                FLOWJnegative = indexies[k][i][j - 1]['FLOWJ+'];
            }
            return {
                ...layer,
                k,
                i,
                j,
                'FLOWI-': FLOWInegative,
                'FLOWJ-': FLOWJnegative,
            };
        })
    );

export function makeFlowLayers(data) {
    const {i, j, k, x0, y0, x1, y1, x2, y2, x3, y3, value} = data;
    const FLOWIplus = data['FLOWI+'];
    const FLOWJplus = data['FLOWJ+'];
    const keys = Object.keys(data.i);
    const layers = [];

    keys.forEach(key => {
        const kValue = k[key];
        if (!layers[kValue]) {
            layers[kValue] = [];
        }
        layers[kValue].push({
            i: i[key],
            j: j[key],
            k: k[key],
            points: [
                [x0[key], y0[key]],
                [x1[key], y1[key]],
                [x2[key], y2[key]],
                [x3[key], y3[key]],
            ],
            value: value[key],
            'FLOWI+': FLOWIplus[key],
            'FLOWJ+': FLOWJplus[key],
        });
    });
    const indexies = getIndexies(layers);
    return addNegativeFlow({layers, indexies});
}

export const make2DLayers = ({
    i,
    j,
    k,
    x0,
    y0,
    x1,
    y1,
    x2,
    y2,
    x3,
    y3,
    value,
}) => {
    const layers = [];
    Object.keys(i).forEach(key => {
        const kValue = k[key];
        if (!layers[kValue]) {
            layers[kValue] = [];
        }
        layers[kValue].push({
            i: i[key],
            j: j[key],
            k: k[key],
            points: [
                [x0[key], y0[key]],
                [x1[key], y1[key]],
                [x2[key], y2[key]],
                [x3[key], y3[key]],
            ],
            value: value[key],
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

const init2DMap = ({elementSelector, data, height, layerNames}) => {
    const layers = make2DLayers(data);
    const map = new Map2D({
        elementSelector,
        layers,
        layerNames,
        height,
    });
    map.init();
};

const parseData = data => (typeof data === 'string' ? JSON.parse(data) : data);

const shouldRenderFlowMap = data => Boolean(data['FLOWI+']);

class Map extends Component {
    constructor(props) {
        super(props);
        this.canvas = null;
        this.canvasId = `canvas-${props.id}`;
        this.elementId = `container-${props.id}`;
    }

    componentDidMount() {
        if (this.canvas) {
            const {data, height, layerNames} = this.props;
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
        const {height} = this.props;
        return (
            <div
                style={{
                    height: `${height}px`,
                    marginBottom: `${height}px`,
                }}
            >
                <div id={this.elementId}>
                    <canvas
                        id={this.canvasId}
                        ref={ref => {
                            this.canvas = ref;
                        }}
                        style={{
                            pointerEvents: 'none',
                            position: 'absolute',
                            zIndex: '1',
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
     * The data the Map component should render.
     * It should be JSON stringified before hand
     */
    data: PropTypes.string.isRequired,
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
