/**
 * Component for displaying a colour bar for various values
 * (e.g. a depth colour bar on a map)
 */
export default class ColorScale {
    constructor(config = {}) {
        this.validate(config);

        this.scale = config.scale;
        this.COLORBAR_WIDTH = 200;
        this.NUMBER_COLORBARS = 50;
    }

    validate(config) {
        if (!config.parentElement) {
            throw new Error('Parent element not provided');
        }

        if (!config.scale) {
            throw new Error('No scale provided');
        }

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

        this.parentElement = config.parentElement;
        this.labelMin = config.labelMin ? config.labelMin : '';
        this.labelMax = config.labelMax ? config.labelMax : '';
    }

    render() {
        this.renderContainer();
        this.renderScale();
    }

    renderContainer() {
        this.element = this.parentElement
            .append('g')
            .attr(
                'transform',
                `translate(${this.position.x},${this.position.y})`
            );
    }

    renderScale() {
        this._renderColorBar();
        this._renderMinLabel();
        this._renderMaxLabel();
    }

    _renderColorBar() {
        for (let i = 0; i < this.NUMBER_COLORBARS; i += 1) {
            this.element
                .append('rect')
                .attr('x', (this.COLORBAR_WIDTH / this.NUMBER_COLORBARS) * i)
                .attr('width', this.COLORBAR_WIDTH / this.NUMBER_COLORBARS)
                .attr('height', 8)
                .attr('stroke', this.scale(i / this.NUMBER_COLORBARS))
                .attr('fill', this.scale(i / this.NUMBER_COLORBARS));
        }

        this.element
            .append('rect')
            .attr('width', this.COLORBAR_WIDTH)
            .attr('height', 8)
            .attr('fill', 'none')
            .attr('stroke', 'black');
        this.element
            .append('line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 8)
            .attr('y2', 12)
            .attr('stroke', 'black');
        this.element
            .append('line')
            .attr('x1', this.COLORBAR_WIDTH)
            .attr('x2', this.COLORBAR_WIDTH)
            .attr('y1', 8)
            .attr('y2', 12)
            .attr('stroke', 'black');
    }

    _renderMinLabel() {
        this.element
            .append('text')
            .attr('x', 0)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .text(this.labelMin);
    }

    _renderMaxLabel() {
        this.element
            .append('text')
            .attr('x', this.COLORBAR_WIDTH)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .text(this.labelMax);
    }
}
