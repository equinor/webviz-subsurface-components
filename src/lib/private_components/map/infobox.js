/* eslint-disable react/require-render-return */
import Component from './component';

export default class InfoBox extends Component {
    static validate(config) {
        if (!config.parentElement) {
            throw new Error('Parent element not provided');
        }
    }

    constructor(config = {}) {
        super();

        this.constructor.validate(config);

        this.parentElement = config.parentElement;
        this.position = config.initialPosition
            ? config.initialPosition
            : {x: 0, y: 0};
    }

    setX(value) {
        this.xElement.text(value);
    }

    setY(value) {
        this.yElement.text(value);
    }

    setValue(value) {
        this.valueElement.text(value);
    }

    renderContainer() {
        this.element = this.parentElement
            .append('g')
            .attr('id', 'g_infobox')
            .attr('class', 'map_2d_infobox')
            .attr(
                'transform',
                `translate(${this.position.x},${this.position.y})`
            );
    }

    renderInformationLines() {
        this.valueElement = this.element
            .append('text')
            .attr('id', 'valueInfo')
            .attr('x', 5)
            .attr('y', 15)
            .attr('opacity', 0.6);
        this.xElement = this.element
            .append('text')
            .attr('id', 'xInfo')
            .attr('x', 5)
            .attr('y', 45)
            .attr('opacity', 0.6);
        this.yElement = this.element
            .append('text')
            .attr('id', 'yInfo')
            .attr('x', 5)
            .attr('y', 60)
            .attr('opacity', 0.6);
    }

    render() {
        this.renderContainer();
        this.renderInformationLines();
    }
}
