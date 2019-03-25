import chai from 'chai'
import sinonChai from 'sinon-chai'
import sinon from 'sinon'
import * as d3 from 'd3'
import Legend from '../legend'

chai.use(sinonChai)

const { expect } = chai


describe('Legend component', () => {

    const createValidLegend = () => {
        const svg = d3.select('body').append('svg')

        const legend = new Legend({
            parentElement: svg,
        })

        return legend
    }

    describe('constructor', () => {
        it('should validate the config', () => {
            const spy = sinon.spy(Legend.prototype, 'validate')

            const legend = createValidLegend()

            expect(spy).to.be.called
        })
    })


    describe('validate', () => {
        it('should throw an error if svg element is not provided', () => {
            const invalidLegendConstruction = () => {
                const legend = new Legend()
            }

            expect(invalidLegendConstruction).to.throw('Parent element not provided')
        })
    })

    describe('render', () => {
        it('should render the container element', () => {
            const legend = createValidLegend()

            const spy = sinon.spy(legend, 'renderContainer')

            legend.render()

            expect(spy).to.be.called
        })

        it('should render the legend element', () => {
            const legend = createValidLegend()

            const spy = sinon.spy(legend, 'renderLegend')

            legend.render()

            expect(spy).to.be.called
        })
    })

    describe('loadData', () => {
        it('should set the data property', () => {
            const legend = createValidLegend()
            const data = [
                {
                    label: 'Simulated values too high',
                    box: {
                        colour: '#34A037',
                        stroke: '#050',
                        fillOpacity: 0.7,
                    },
                },
            ]

            legend.loadData(data)

            expect(legend.data).to.deep.equal(data)
        })

        it('should not render the legend if legend wasnt rendered before', () => {
            const legend = createValidLegend()
            const data = [
                {
                    label: 'Simulated values too high',
                    box: {
                        colour: '#34A037',
                        stroke: '#050',
                        fillOpacity: 0.7,
                    },
                },
            ]
            const spy = sinon.spy(legend, 'renderLegend')

            legend.loadData(data)

            expect(spy).not.to.be.called
        })

        it('should not render the legend if legend wasnt rendered before', () => {
            const legend = createValidLegend()
            const data = [
                {
                    label: 'Simulated values too high',
                    box: {
                        colour: '#34A037',
                        stroke: '#050',
                        fillOpacity: 0.7,
                    },
                },
            ]

            legend.render()

            const spy = sinon.spy(legend, 'renderLegend')

            legend.loadData(data)

            expect(spy).to.be.called
        })
    })
})
