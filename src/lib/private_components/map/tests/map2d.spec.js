import sinon from 'sinon';
import Map2D from '../map2d';

describe('Map2d', () => {
    const createValidMap2d = () => {
        const map = new Map2D({
            elementSelector: '#map_2d',
            plotOptions: {
                xMin: 0,
                xMax: 0,
                yMin: 0,
                yMax: 0,
                precisionCoord: 0,
                precisionValues: 0,
                colorMap: 'viridis',
                picturePath: '',
                layerNames: ['name'],
                minVal: 0,
                maxVal: 0,
            },
            layers: [[{points: [[]], value: 0}]],
        });
        return map;
    };

    describe('constructor', () => {});

    describe('init', () => {
        it('should initialize map component', () => {
            const map = createValidMap2d();
            const spy = sinon.spy(map, 'initMap');

            map.init();

            expect(spy.called);
            spy.restore();
        });

        it('should initialize compass component', () => {
            const map = createValidMap2d();
            const spy = sinon.spy(map, 'initCompass');

            map.init();

            expect(spy.called);
            spy.restore();
        });

        it('should initialize compass component', () => {
            const map = createValidMap2d();
            const spy = sinon.spy(map, 'initCompass');

            map.init();

            expect(spy.called);
            spy.restore();
        });

        it('should initialize layer slider component', () => {
            const map = createValidMap2d();
            const spy = sinon.spy(map, 'initLayerSlider');

            map.init();

            expect(spy.called);
            spy.restore();
        });

        it('should initialize infobox component', () => {
            const map = createValidMap2d();
            const spy = sinon.spy(map, 'initInfoBox');

            map.init();

            expect(spy.called);
            spy.restore();
        });

        it('should initialize depth scale component', () => {
            const map = createValidMap2d();
            const spy = sinon.spy(map, 'initDepthScale');

            map.init();

            expect(spy.called);
            spy.restore();
        });

        it('should initialize distance scale component', () => {
            const map = createValidMap2d();
            const spy = sinon.spy(map, 'initDistanceScale');

            map.init();

            expect(spy.called);
            spy.restore();
        });
    });
});
