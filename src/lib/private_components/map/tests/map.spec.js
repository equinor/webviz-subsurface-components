import sinon from 'sinon';
import * as d3 from 'd3';
import Map from '../map';

describe('Map', () => {
    const createValidMap = () =>
        new Map({
            parentElement: d3.select('body').append('svg'),
            coords: [
                [
                    [[0, 7306], [116, 7373], [182, 7259], [66, 7192]],
                    [[0, 7306], [116, 7373], [182, 7259], [66, 7192]],
                    [[0, 7306], [116, 7373], [182, 7259], [66, 7192]],
                ],
            ],
            values: {0: [414, 415, 418]},
            colorScale: d3.interpolateViridis,
        });

    describe('constructor', () => {
        it('should validate the input', () => {
            const spy = sinon.spy(Map, 'validate');

            createValidMap();

            expect(spy.called);
            spy.restore();
        });
    });

    describe('validate', () => {
        it('should throw an error if svg element is not provided', () => {
            const invalidMapConstruction = () => new Map();

            expect(invalidMapConstruction).toThrow(
                'Parent element not provided'
            );
        });

        it('should throw an error if no coords provided', () => {
            const invalidMapConstruction = () =>
                new Map({
                    parentElement: d3.select('body').append('svg'),
                });

            expect(invalidMapConstruction).toThrow('Coords not provided');
        });

        it('should throw an error if no values provided', () => {
            const invalidMapConstruction = () =>
                new Map({
                    parentElement: d3.select('body').append('svg'),
                    coords: [],
                });

            expect(invalidMapConstruction).toThrow('Values not provided');
        });

        it('should throw an error if no color scale provided', () => {
            const invalidMapConstruction = () =>
                new Map({
                    parentElement: d3.select('body').append('svg'),
                    coords: [],
                    values: [],
                });

            expect(invalidMapConstruction).toThrow('Color scale not provided');
        });
    });

    describe('render', () => {
        it('should render the container element', () => {
            const map = createValidMap();

            const spy = sinon.spy(map, 'renderContainer');

            map.render();

            expect(spy.called);
            spy.restore();
        });

        it('should render the cells', () => {
            const map = createValidMap();

            const spy = sinon.spy(map, 'renderCells');

            map.render();

            expect(spy.called);
            spy.restore();
        });
    });
});
