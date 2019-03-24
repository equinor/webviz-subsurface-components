/* eslint-env node, mocha */
import chai from 'chai'
import sinonChai from 'sinon-chai'
import sinon from 'sinon'
import Component from '../component'

const { expect } = chai
chai.use(sinonChai)


describe('Component', () => {
    it('on should delegate the call to eventBus.on', () => {
        const component = new Component()
        const spy = sinon.spy(component.eventBus, 'on')
        const handler = sinon.spy()

        component.on('event', handler)

        expect(spy).to.be.calledWith('event', handler)
    })

    it('emit should delegate the call to eventBus.emit', () => {
        const component = new Component()
        const spy = sinon.spy(component.eventBus, 'emit')
        const handlerData = {}

        component.emit('event', handlerData)

        expect(spy).to.be.calledWith('event', handlerData)
    })

    it('off should delegate the call to eventBus.off', () => {
        const component = new Component()
        const spy = sinon.spy(component.eventBus, 'off')
        const handler = sinon.spy()

        component.off('event', handler)

        expect(spy).to.be.calledWith('event', handler)
    })
})
