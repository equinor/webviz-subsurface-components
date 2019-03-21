import sinon from 'sinon';
import * as d3 from 'd3';
import InfoBox from '../infobox';
import {cleanUpDOM} from './testingUtils';

describe('Scale', () => {
    afterEach(cleanUpDOM);

    const createValidInfoBox = () =>
        new InfoBox({
            parentElement: d3.select('body').append('svg'),
        });

    describe('constructor', () => {
        it('should validate the input', () => {
            const spy = sinon.spy(InfoBox, 'validate');

            createValidInfoBox();

            expect(spy.called);
            spy.restore();
        });
    });

    describe('validate', () => {
        it('should throw an error if svg element is not provided', () => {
            const invalidInfoBoxConstruction = () => new InfoBox();

            expect(invalidInfoBoxConstruction).toThrow(
                'Parent element not provided'
            );
        });
    });

    describe('render', () => {
        it('should render the container element', () => {
            const infobox = createValidInfoBox();

            const spy = sinon.spy(infobox, 'renderContainer');

            infobox.render();

            expect(spy.called);
            spy.restore();
        });

        it('should render the information lines', () => {
            const infobox = createValidInfoBox();

            const spy = sinon.spy(infobox, 'renderInformationLines');

            infobox.render();

            expect(spy.called);
            spy.restore();
        });
    });

    describe('setX', () => {
        it('should set the x text of the box to the value', () => {
            const infobox = createValidInfoBox();

            infobox.render();

            infobox.setX('x: 100');

            const xElement = d3.select('#g_infobox #xInfo');

            expect(xElement.text()).toEqual('x: 100');
        });
    });

    describe('setY', () => {
        it('should set the y text of the box to the value', () => {
            const infobox = createValidInfoBox();

            infobox.render();

            infobox.setY('y: 100');

            const yElement = d3.select('#g_infobox #yInfo');

            expect(yElement.text()).toEqual('y: 100');
        });
    });

    describe('setValue', () => {
        it('should set the value text of the box to the value', () => {
            const infobox = createValidInfoBox();

            infobox.render();

            infobox.setValue('value: 100');

            const valueElement = d3.select('#g_infobox #valueInfo');

            expect(valueElement.text()).toEqual('value: 100');
        });
    });
});
