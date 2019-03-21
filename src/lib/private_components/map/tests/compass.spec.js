import sinon from 'sinon';
import * as d3 from 'd3';
import Compass from '../compass';
import SVGTransform from '../util';
import {cleanUpDOM} from './testingUtils';

describe('Compass component', () => {
    afterEach(cleanUpDOM);

    const createValidCompass = () => {
        const svg = d3.select('body').append('svg');

        const compass = new Compass({
            parentElement: svg,
        });

        return compass;
    };

    describe('initDragEvents', () => {
        it('should initialize the drag events', () => {
            const compass = createValidCompass();

            compass.render();
            const spy = sinon.spy(compass.element, 'call');

            compass.initDragEvents();

            expect(spy.called);
            spy.restore();
        });
    });

    describe('constructor', () => {
        it('should validate the input', () => {
            const spy = sinon.spy(Compass, 'validate');

            createValidCompass();

            expect(spy.called);
            spy.restore();
        });

        it('should throw an error if svg element is not provided', () => {
            const invalidCompassConstruction = () => new Compass();

            expect(invalidCompassConstruction).toThrow(
                'Parent element not provided'
            );
        });

        it('should not throw an error if svg element is provided', () => {
            expect(createValidCompass).not.toThrow(
                'Parent element not provided'
            );
        });

        it('should set position.x to 0 if no initialPosition is provided', () => {
            const compass = createValidCompass();

            expect(compass.position.x).toEqual(0);
        });

        it('should set position.y to 0 if no initialPosition is provided', () => {
            const compass = createValidCompass();

            expect(compass.position.y).toEqual(0);
        });

        it('should set position.x to initialPosition.x if initialPosition is provided', () => {
            const initialPosition = {
                x: 50,
                y: 50,
            };
            const compass = new Compass({
                parentElement: d3.select('body').append('svg'),
                initialPosition,
            });

            expect(compass.position.x).toEqual(initialPosition.x);
        });

        it('should set position.y to initialPosition.y if initialPosition is provided', () => {
            const initialPosition = {
                x: 50,
                y: 60,
            };

            const compass = new Compass({
                parentElement: d3.select('body').append('svg'),
                initialPosition,
            });

            expect(compass.position.y).toEqual(initialPosition.y);
        });

        it('should set rotation to 0 if no initialRotation is provided', () => {
            const compass = createValidCompass();

            expect(compass.initialRotation).toEqual(0);
        });

        it('should set rotation to initialRotation if initialRotation is provided', () => {
            const initialRotation = 30;

            const compass = new Compass({
                parentElement: d3.select('body').append('svg'),
                initialRotation,
            });

            expect(compass.initialRotation).toEqual(initialRotation);
        });
    });

    describe('render', () => {
        it('should create the compass element inside the parent element', () => {
            const compass = createValidCompass();
            const spy = sinon.spy(compass, 'renderContainer');

            compass.render();

            expect(spy.called);

            const selectionArray = d3.selectAll('#g_compass');

            expect(selectionArray.empty()).toBe(false);
            spy.restore();
        });

        it('should set the position of the compass elemenent', () => {
            const initialPosition = {
                x: 50,
                y: 60,
            };
            const compass = new Compass({
                parentElement: d3.select('body').append('svg'),
                initialPosition,
            });

            compass.render();

            const compassElement = d3.select('#g_compass');
            const {transform} = new SVGTransform(
                compassElement.attr('transform')
            );

            expect(transform.translate).toBeDefined();
            expect(transform.translate[0]).toEqual(`${initialPosition.x}`);
            expect(transform.translate[1]).toEqual(`${initialPosition.y}`);
        });

        it('should set the rotation of the compass elemenent', () => {
            const initialRotation = 0;
            const compass = new Compass({
                parentElement: d3.select('body').append('svg'),
                initialRotation,
            });

            compass.render();

            const compassElement = d3.select('#g_compass');
            const {transform} = new SVGTransform(
                compassElement.attr('transform')
            );

            expect(transform.rotate).toBeDefined();
            expect(transform.rotate[0]).toEqual(`${initialRotation}`);
            expect(transform.rotate[1]).toEqual(`${100}`);
            expect(transform.rotate[2]).toEqual(`${100}`);
        });

        it('should render the compass shape', () => {
            const compass = createValidCompass();
            const spy = sinon.spy(compass, 'renderShape');

            compass.render();

            expect(spy.called);
            spy.restore();
        });

        it('should render the direction letters', () => {
            const compass = createValidCompass();
            const spy = sinon.spy(compass, 'renderLetters');

            compass.render();

            expect(spy.called);
            spy.restore();
        });
    });
});
