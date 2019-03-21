import * as d3 from 'd3'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import sinon from 'sinon'
import jsdom from 'jsdom-global'
import HistoryMatchingPlot from './history_matching_plot'

chai.use(sinonChai)

const { expect } = chai

describe('History Matching Plot', () => {
    beforeEach(() => {
        jsdom(
            `<body>
                <div id="history_matching">
                </div>
            </body>
        `,
        )
    })

    const createValidPlot = () => new HistoryMatchingPlot({
        parentElement: d3.select('body').append('svg'),
        confidenceIntervalUnsorted: { high: 0, low: 0 },
        confidenceIntervalSorted: { high: [], low: [] },
    })

    describe('constructor', () => {
        it('should validate the config', () => {
            const spy = sinon.spy(HistoryMatchingPlot.prototype, 'validate')

            const plot = createValidPlot()

            expect(spy).to.be.called
        })
    })

    describe('validate', () => {
        it('should throw an error if svg element is not provided', () => {
            const invalidPlotConstruction = () => {
                const plot = new HistoryMatchingPlot()
            }

            expect(invalidPlotConstruction).to.throw('Parent element not provided')
        })
    })

    describe('setData', () => {
        it('should set the data property', () => {
            const plot = createValidPlot()
            const data = [{
                positive: [],
                negative: [],
                labels: [],
            }]

            plot.setData(data)

            expect(plot.data).to.deep.equal(data)
        })
    })

    describe('render', () => {
        it('should render the container element', () => {
            const plot = createValidPlot()

            const spy = sinon.spy(plot, 'renderContainer')

            plot.render()

            expect(spy).to.be.called
        })

        it('should render the plot element', () => {
            const plot = createValidPlot()

            const spy = sinon.spy(plot, 'renderPlot')

            plot.render()

            expect(spy).to.be.called
        })
    })
})
