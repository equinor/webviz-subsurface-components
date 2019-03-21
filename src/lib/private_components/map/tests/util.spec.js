import sinon from 'sinon';
import SVGTransform from '../util';

describe('SVGTransform', () => {
    describe('constructor', () => {
        it('should parse the transform string', () => {
            const spy = sinon.spy(SVGTransform.prototype, 'parseTransform');

            const transform = new SVGTransform(); // eslint-disable-line no-unused-vars

            expect(spy.called);
            spy.restore();
        });
    });

    describe('addTransform', () => {
        it("should add a transform if it doesn't exist", () => {
            const transform = new SVGTransform();

            expect(transform.transform.translate).toBeUndefined();

            transform.addTransform('translate', [0, 0]);

            expect(transform.transform.translate).toEqual(['0', '0']);
        });

        it('should correctly update an existing transform', () => {
            const transform = new SVGTransform('translate(0,0)');

            expect(transform.transform.translate).toEqual(['0', '0']);

            transform.addTransform('translate', [100, 100]);

            expect(transform.transform.translate).toEqual(['100', '100']);
        });
    });
});
