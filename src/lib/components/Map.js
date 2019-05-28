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
    const i_index = data['columns'].indexOf('i')
    const j_index = data['columns'].indexOf('j')
    const k_index = data['columns'].indexOf('k')
    const x0_index = data['columns'].indexOf('x0')
    const x1_index = data['columns'].indexOf('x1')
    const x2_index = data['columns'].indexOf('x2')
    const x3_index = data['columns'].indexOf('x3')
    const y0_index = data['columns'].indexOf('y0')
    const y1_index = data['columns'].indexOf('y1')
    const y2_index = data['columns'].indexOf('y2')
    const y3_index = data['columns'].indexOf('y3')
    const value_index = data['columns'].indexOf('value')
    const FLOWIplus_index = data['columns'].indexOf('FLOWI+')
    const FLOWJplus_index = data['columns'].indexOf('FLOWJ+')

    const layers = [];

    data['values'].forEach(values => {
        const kValue = values[k_index];
        if (!layers[kValue]) {
            layers[kValue] = [];
        }
        layers[kValue].push({
            i: values[i_index],
            j: values[j_index],
            k: values[k_index],
            points: [
                [values[x0_index], values[y0_index]],
                [values[x1_index], values[y1_index]],
                [values[x2_index], values[y2_index]],
                [values[x3_index], values[y3_index]]
            ],
            value: values[value_index],
            'FLOWI+': values[FLOWIplus_index],
            'FLOWJ+': values[FLOWJplus_index]
        });
    });

    const indexies = getIndexies(layers);
    return addNegativeFlow({layers, indexies});
}

export const make2DLayers = (data) => {
    const i_index = data['columns'].indexOf('i')
    const j_index = data['columns'].indexOf('j')
    const k_index = data['columns'].indexOf('k')
    const x0_index = data['columns'].indexOf('x0')
    const x1_index = data['columns'].indexOf('x1')
    const x2_index = data['columns'].indexOf('x2')
    const x3_index = data['columns'].indexOf('x3')
    const y0_index = data['columns'].indexOf('y0')
    const y1_index = data['columns'].indexOf('y1')
    const y2_index = data['columns'].indexOf('y2')
    const y3_index = data['columns'].indexOf('y3')
    const value_index = data['columns'].indexOf('value')

    const layers = [];

    data['values'].forEach(values => {
        const kValue = values[k_index];
        if (!layers[kValue]) {
            layers[kValue] = [];
        }
        layers[kValue].push({
            i: values[i_index],
            j: values[j_index],
            k: values[k_index],
            points: [
                [values[x0_index], values[y0_index]],
                [values[x1_index], values[y1_index]],
                [values[x2_index], values[y2_index]],
                [values[x3_index], values[y3_index]]
            ],
            value: values[value_index],
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

const shouldRenderFlowMap = data => data['columns'].includes('FLOWI+');

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
