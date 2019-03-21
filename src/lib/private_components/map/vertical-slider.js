/* eslint-disable react/require-render-return */
import * as d3 from 'd3';
import Component from './component';

function appendClone() {
    return this.parentNode.appendChild(this.cloneNode(true));
}

export default class VerticalSlider extends Component {
    static validate(config) {
        if (!config.parentElement) {
            throw new Error('Parent element not provided');
        }

        if (!config.values) {
            throw new Error('Values not provided');
        }

        if (!config.height) {
            throw new Error('Height not provided');
        }
    }

    constructor(config = {}) {
        super();
        this.constructor.validate(config);

        this.parentElement = config.parentElement;
        this.values = config.values;
        this.value = 0;

        this.scale = d3
            .scaleLinear()
            .domain([0, this.values.length - 1])
            .range([0, config.height])
            .clamp(true);

        if (config.initialPosition) {
            this.position = {
                x: config.initialPosition.x,
                y: config.initialPosition.y,
            };
        } else {
            this.position = {
                x: 0,
                y: 0,
            };
        }
    }

    setPosition({x, y}) {
        this.position.x = x;
        this.position.y = y;

        this.element.attr('transform', `translate(${x},${y})`);
    }

    _onDragSlider(h) {
        if (Math.round(h) !== this.value) {
            this.value = Math.round(h);

            this.handle.attr('cy', this.scale(this.value));

            this.text
                .attr('y', this.scale(this.value))
                .text(this.values[this.value]);

            this.emit('change', this.value);
        }
    }

    _renderLine() {
        const self = this;
        this.slider = this.element
            .append('g')
            .attr('class', 'slider')
            .attr('style', 'stroke-width: 8px; stroke-linecap: round');

        this.slider
            .append('line')
            .attr('class', 'track')
            .attr('y1', this.scale.range()[0])
            .attr('y2', this.scale.range()[1])
            .attr(
                'style',
                'stroke-linecap: round; stroke: #000; stroke-opacity: 0.3; stroke-width: 10px'
            )
            .select(appendClone)
            .attr('class', 'track-inset')
            .attr(
                'style',
                'stroke-linecap: round; stroke: #ddd; stroke-width: 8px'
            )
            .select(appendClone)
            .attr('class', 'track-overlay')
            .attr(
                'style',
                'stroke-linecap: round; pointer-events: stroke; stroke-width: 50px; stroke: transparent; cursor: grab'
            )
            .call(
                d3
                    .drag()
                    .on('start.interrupt', () => {
                        self.slider.interrupt();
                    })
                    .on('start drag', () => {
                        self._onDragSlider(this.scale.invert(d3.event.y));
                    })
            );
    }

    _renderHandle() {
        this.handle = this.slider
            .insert('circle', '.track-overlay')
            .attr('class', 'handle')
            .attr(
                'style',
                'fill: #fff; stroke: #000; stroke-opacity: 0.5; stroke-width: 1.25px'
            )
            .attr('r', 9);
    }

    _renderLabel() {
        this.text = this.slider
            .append('text')
            .text(this.values[this.value])
            .attr('x', -12)
            .attr('y', 0)
            .style('font-size', 30)
            .attr('text-anchor', 'end')
            .attr('cursor', 'default')
            .attr('alignment-baseline', 'middle');
    }

    renderSlider() {
        this._renderLine();
        this._renderHandle();
        this._renderLabel();
    }

    renderContainer() {
        this.element = this.parentElement
            .append('g')
            .attr('id', 'g_slider')
            .attr(
                'transform',
                `translate(${this.position.x}, ${this.position.y})`
            );
    }

    render() {
        this.renderContainer();
        this.renderSlider();
    }
}
