import sinon from 'sinon';
import Component from '../component';

describe('Component', () => {
    it('on should delegate the call to eventBus.on', () => {
        const component = new Component();
        const spy = sinon.spy(component.eventBus, 'on');
        const handler = sinon.spy();

        component.on('event', handler);
        expect(spy.calledWith('event', handler));
        spy.restore();
    });

    it('emit should delegate the call to eventBus.emit', () => {
        const component = new Component();
        const spy = sinon.spy(component.eventBus, 'emit');
        const handlerData = {};

        component.emit('event', handlerData);

        expect(spy.calledWith('event', handlerData));
        spy.restore();
    });

    it('off should delegate the call to eventBus.off', () => {
        const component = new Component();
        const spy = sinon.spy(component.eventBus, 'off');
        const handler = sinon.spy();

        component.off('event', handler);

        expect(spy.calledWith('event', handler));
        spy.restore();
    });
});
