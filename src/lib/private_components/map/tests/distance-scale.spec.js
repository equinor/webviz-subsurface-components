import sinon from 'sinon';
import * as d3 from 'd3';
import DistanceScale from '../distance-scale';

describe('Scale', () => {
    const createValidScale = () =>
        new DistanceScale({
            parentElement: d3.select('body').append('svg'),
            initialK: 10,
            origMeter2Px: 1,
        });

    describe('constructor', () => {
        it('should validate the input', () => {
            const spy = sinon.spy(DistanceScale.prototype, 'validate');

            createValidScale();

            expect(spy.called);
            spy.restore();
        });

        it('should throw an error if svg element is not provided', () => {
            const invalidScaleConstruction = () => new DistanceScale();

            expect(invalidScaleConstruction).toThrow(
                'Parent element not provided'
            );
        });

        it('should throw an error if initialK is undefined', () => {
            const invalidScaleConstruction = () =>
                new DistanceScale({parentElement: {}});

            expect(invalidScaleConstruction).toThrow(
                'Initial K value not provided'
            );
        });

        it('should throw an error if initialK is <= 0', () => {
            const invalidScaleConstruction = () =>
                new DistanceScale({
                    parentElement: {},
                    initialK: 0,
                });

            expect(invalidScaleConstruction).toThrow(
                'Initial K cannot be 0 or undefined'
            );
        });

        it('should throw an error if origMeter2Px is undefined', () => {
            const invalidScaleConstruction = () =>
                new DistanceScale({
                    parentElement: {},
                    initialK: 10,
                });

            expect(invalidScaleConstruction).toThrow(
                'origMeter2Px not provided'
            );
        });
    });

    describe('render', () => {
        it('should render the element inside of parent element', () => {
            const scale = createValidScale();

            const spy = sinon.spy(scale, 'renderContainer');

            scale.render();

            expect(spy.called);

            const scaleElement = d3.selectAll('#g_scale');
            expect(scaleElement.size()).toBeGreaterThan(0);
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
