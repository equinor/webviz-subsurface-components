import sinon from 'sinon';
import * as d3 from 'd3';
import ColorScale from '../color-scale';
import {cleanUpDOM} from './testingUtils';

describe('Color scale', () => {
    afterEach(cleanUpDOM);

    const createValidScale = () =>
        new ColorScale({
            parentElement: d3.select('body').append('svg'),
            scale: d3.interpolateViridis,
        });

    describe('constructor', () => {
        it('should validate the input', () => {
            const spy = sinon.spy(ColorScale.prototype, 'validate');

            const scale = new ColorScale({
                parentElement: d3.select('body').append('svg'),
                scale: d3.interpolateViridis,
            });

            scale.render();

            expect(spy.called);
            spy.restore();
        });

        it('should throw an error if svg element is not provided', () => {
            const invalidScaleConstruction = () => new ColorScale();

            expect(invalidScaleConstruction).toThrow(
                'Parent element not provided'
            );
        });

        it('should throw error if no scale provided', () => {
            const invalidColorScaleConstruction = () =>
                new ColorScale({
                    parentElement: d3.select('body').append('svg'),
                });
            expect(invalidColorScaleConstruction).toThrow('No scale provided');
        });
    });

    describe('render', () => {
        it('should render the container element', () => {
            const scale = createValidScale();

            const spy = sinon.spy(scale, 'renderContainer');

            scale.render();

            expect(spy.called);
            spy.restore();
        });

        it('should render the scale', () => {
            const scale = createValidScale();

            const spy = sinon.spy(scale, 'renderScale');

            scale.render();

            expect(spy.called);
            spy.restore();
        });
    });
});
