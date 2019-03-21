/* eslint-disable react/require-render-return */
import * as d3 from 'd3';
import SVGTransform from './util';
import Component from './component';

export default class Compass extends Component {
    static validate({parentElement}) {
        if (!parentElement) {
            throw new Error('Parent element not provided.');
        }
    }

    static calculateAngleFromCoord(x, y) {
        let angle = 0;

        if (x - 100 < 0) {
            angle = 180 + (Math.atan((y - 100) / (x - 100)) * 180) / Math.PI;
        } else {
            angle = (Math.atan((y - 100) / (x - 100)) * 180) / Math.PI;
        }

        return angle;
    }

    constructor(config = {}) {
        super();

        this.constructor.validate(config);
        this.parentElement = config.parentElement;
        this.position = config.initialPosition
            ? config.initialPosition
            : {x: 0, y: 0};
        this.initialRotation = config.initialRotation
            ? config.initialRotation
            : 0;

        this.dragStartAngle = 0;
        this.dragAngle = 0;
        this.rotationAngle = 0;
    }

    setPosition({x, y}) {
        this.position.x = x;
        this.position.y = y;

        this.applyTransform();
    }

    setRotation(rotation) {
        this.rotationAngle = rotation;

        this.applyTransform();
    }

    _dragStarted() {
        const [x, y] = d3.mouse(this.element.node());

        this.element.selectAll('polygon').attr('fill', '#A75C7C');

        this.dragStartAngle = this.constructor.calculateAngleFromCoord(x, y);
    }

    _dragged() {
        const [x, y] = d3.mouse(this.element.node());

        this.dragAngle = this.constructor.calculateAngleFromCoord(x, y);

        this.rotationAngle =
            (this.rotationAngle + this.dragAngle - this.dragStartAngle) % 360;

        this.applyTransform();

        this.emit('dragged', this.rotationAngle);
    }

    _createElement() {
        this.element = this.parentElement.append('g').attr('id', 'g_compass');
    }

    _dragEnded() {
        this.element.selectAll('polygon').attr('fill', '#DA8FAF');
    }

    initDragEvents() {
        this.element.call(
            d3
                .drag()
                .on('start', this._dragStarted.bind(this))
                .on('drag', this._dragged.bind(this))
                .on('end', this._dragEnded.bind(this))
        );
    }

    applyTransform() {
        const transform = new SVGTransform();

        transform.addTransform('translate', [this.position.x, this.position.y]);
        transform.addTransform('rotate', [
            -this.initialRotation + this.rotationAngle,
            100,
            100,
        ]);

        this.element.attr('transform', transform.toString());
    }

    renderContainer() {
        this._createElement();
        this.setPosition(this.position);
        this.setRotation(this.initialRotation);
    }

    renderShape() {
        const compassCoords = [
            '100,30 85,85 30,100 85,115 100,170 115,115 170,100 115,85',
            '100,100 85,115 100,170',
            '100,100 115,115 170,100',
            '100,100 100,30, 115,85',
            '100,100 85,85 30,100',
        ];

        this.element
            .selectAll('polygon')
            .data(compassCoords)
            .enter()
            .append('polygon')
            .attr('points', d => d)
            .attr('fill', '#DA8FAF')
            .attr('opacity', '0.5')
            .style('pointer-events', 'visiblePainted');
    }

    renderLetters() {
        this.element
            .append('text')
            .attr('x', 100)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text('N');

        this.element
            .append('text')
            .attr('x', 180)
            .attr('y', 100)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text('E');
        this.element
            .append('text')
            .attr('x', 100)
            .attr('y', 180)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text('S');
        this.element
            .append('text')
            .attr('x', 20)
            .attr('y', 100)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .text('W');
    }

    render() {
        this.renderContainer();
        this.renderShape();
        this.renderLetters();
    }
}
