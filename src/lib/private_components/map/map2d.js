import * as d3 from 'd3';
import Map from './map';
import Compass from './compass';
import DistanceScale from './distance-scale';
import ColorScale from './color-scale';
import InfoBox from './infobox';
import VerticalSlider from './vertical-slider';
import Component from './component';

export default class Map2D extends Component {
    constructor({
        elementSelector,
        layers,
        height = 800,
        width = undefined,
        colorMap = 'viridis',
        valUnit = '',
        layerNames = [],
    }) {
        super();
        this.elementSelector = elementSelector;
        this._calcMinMax(layers);
        this.colorMap = colorMap;
        this.valUnit = valUnit;
        this.layerNames = layerNames;
        this.layers = layers;
        this.coords = layers.map(cells => cells.map(cell => cell.points));
        this.values = layers.map(cells => cells.map(cell => cell.value));
        this.height = height;
        const node = d3.select(elementSelector).node();
        if (width) {
            this.width = width;
        } else if (node) {
            this.width = node.offsetWidth;
        }

        this.MARGIN = {
            TOP: 50,
            RIGHT: 200,
            BOTTOM: 20,
            LEFT: 40,
        };

        this._calculateDimensions();
    }

    _calcMinMax(layers) {
        const cells = d3.merge(layers);
        const points = d3.merge(cells.map(cell => cell.points));

        [this.xMin, this.xMax] = d3.extent(points, point => point[0]);
        [this.yMin, this.yMax] = d3.extent(points, point => point[1]);
        [this.valMax, this.valMin] = d3.extent(cells, cell => cell.value);
    }

    _calculateDimensions() {
        const xRange = this.xMax - this.xMin;
        const yRange = this.yMax - this.yMin;

        if (xRange / this.width > yRange / this.height) {
            this.kInit = this.width / xRange;
            if (yRange > xRange) {
                this.kInit *= yRange / xRange;
            }
            this.origMeter2Px = this.width / xRange / this.kInit;
        } else {
            this.kInit = this.height / yRange;
            if (xRange > yRange) {
                this.kInit *= xRange / yRange;
            }
            this.origMeter2Px = this.height / yRange / this.kInit;
        }

        this.mapTransform = {
            x: 0,
            y: 0,
            k: this.kInit,
            angle: 0,
        };
    }

    _isHorizontal() {
        const xRange = this.xMax - this.xMin;
        const yRange = this.yMax - this.yMin;

        return xRange / this.width > yRange / this.height;
    }

    init() {
        this.initColorScale();
        this.initContainer();
        this.initContainerBorder();

        this.initMap();
        this.initZoom();

        this.initCompass();
        this.initLayerSlider();
        this.initDistanceScale();
        this.initInfoBox();
        this.initDepthScale();

        this.initResize();
    }

    initColorScale() {
        let colorScale;
        switch (this.colorMap) {
            case 'viridis':
                colorScale = d3.interpolateViridis;
                break;
            case 'inferno':
                colorScale = d3.interpolateInferno;
                break;
            case 'warm':
                colorScale = d3.interpolateWarm;
                break;
            case 'cool':
                colorScale = d3.interpolateCool;
                break;
            case 'rainbow':
                colorScale = d3.interpolateRainbow;
                break;
            default:
                colorScale = d3.interpolateViridis;
                break;
        }

        this.colorScale = colorScale;
    }

    initContainer() {
        this.containerMap = d3
            .select(this.elementSelector)
            .attr('class', 'map_2d')
            .append('svg')
            .attr('id', 'svg_map')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('position', 'absolute');

        this.containerControls = d3
            .select(this.elementSelector)
            .append('svg')
            .attr('id', 'svg_controls')
            .style('z-index', 10)
            .style('pointer-events', 'none')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('position', 'absolute');
    }

    initContainerBorder() {
        this.containerControls
            .append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', 'none')
            .attr('stroke', '#aaaaaa')
            .attr('stroke-width', '2');
    }

    initMap() {
        this.map = new Map({
            parentElement: this.containerMap,
            coords: this.coords,
            values: this.values,
            valMax: this.valMax,
            valMin: this.valMin,
            xMin: this.xMin,
            yMax: this.yMax,
            colorScale: this.colorScale,
        });

        this.map.setTransform(this.mapTransform);

        this.map.render();

        this.map.on('mousemove', info => {
            this.infoBox.setX(`x = ${this._calculateXCoord(info.x)}`);
            this.infoBox.setY(`y = ${this._calculateYCoord(info.y)}`);
            this.infoBox.setValue(`${info.value} ${this.valUnit}`);
        });

        this.map.on('mouseleave', () => {
            this.infoBox.setX('');
            this.infoBox.setY('');
            this.infoBox.setValue('');
        });
    }

    _calculateXCoord(x) {
        return parseFloat((x + this.xMin).toFixed(2));
    }

    _calculateYCoord(y) {
        return parseFloat((y - this.yMax).toFixed(2));
    }

    initZoom() {
        const zoomListener = d3
            .zoom()
            .scaleExtent([0.1, 20])
            .on('zoom', this.handleZoom.bind(this));

        zoomListener(this.containerMap);
    }

    handleZoom() {
        const {transform} = d3.event;

        this.mapTransform.x = transform.x;
        this.mapTransform.y = transform.y;
        this.mapTransform.k = transform.k * this.kInit;

        this.scale.setK(this.mapTransform.k);
        this.map.setTransform(this.mapTransform);
        this.emit('zoom', this.mapTransform);
    }

    initCompass() {
        this.compass = new Compass({
            parentElement: this.containerControls,
            initialPosition: {
                x: this.width - 200,
                y: 0,
            },
        });

        this.compass.render();

        this.compass.initDragEvents();
        this.compass.on('dragged', angle => {
            this.mapTransform.angle = angle;
            this.map.setTransform(this.mapTransform);
            this.emit('rotate', this.mapTransform);
        });
    }

    initLayerSlider() {
        if (this.layers.length > 1) {
            const values = this.layerNames.slice();
            for (let i = 0; i < this.layers.length; i += 1) {
                if (!values[i]) {
                    values[i] = i;
                }
            }
            this.layerSlider = new VerticalSlider({
                parentElement: this.containerControls,
                initialPosition: {
                    x: this.width - 20,
                    y: this.MARGIN.TOP + 160,
                },
                values,
                height:
                    this.height - this.MARGIN.TOP - this.MARGIN.BOTTOM - 160,
            });

            this.layerSlider.render();

            this.layerSlider.on('change', value => {
                this.map.setLayer(value);
            });
        }
    }

    initDistanceScale() {
        this.scale = new DistanceScale({
            parentElement: this.containerControls,
            initialK: this.kInit,
            origMeter2Px: this.origMeter2Px,
            initialPosition: {
                x: 45,
                y: 45,
            },
        });

        this.scale.render();
    }

    initInfoBox() {
        this.infoBox = new InfoBox({
            parentElement: this.containerControls,
            initialPosition: {
                x: 0,
                y: this.height - 70,
            },
        });

        this.infoBox.render();
    }

    initDepthScale() {
        this.depthScale = new ColorScale({
            parentElement: this.containerControls,
            scale: this.colorScale,
            initialPosition: {
                x: 45,
                y: 60,
            },
            labelMin: `${this._calculateMinVal()} ${this.valUnit}`,
            labelMax: `${this._calculateMaxVal()} ${this.valUnit}`,
        });

        this.depthScale.render();
    }

    _calculateMinVal() {
        return parseFloat(this.valMin.toPrecision(3));
    }

    _calculateMaxVal() {
        return parseFloat(this.valMax.toPrecision(3));
    }

    initResize() {
        const resize = () => {
            this.width = d3.select(this.elementSelector).node().offsetWidth;

            this.containerMap.attr('width', this.width);
            this.containerControls.attr('width', this.width);

            this.compass.setPosition({
                x: this.width - 200,
                y: 0,
            });

            if (this.layerSlider) {
                this.layerSlider.setPosition({
                    x: this.width - 20,
                    y: this.MARGIN.TOP + 160,
                });
            }
        };

        window.addEventListener('resize', resize);
    }
}
