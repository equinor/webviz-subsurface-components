import React, { Component } from 'react';
import {
    LogViewer, InterpolatedScaleHandler,
    UIHelper,
}  from '@equinor/videx-wellog';

import './styles.scss';

import { select } from 'd3';

import createTracks from './tracks';

function addRubberbandOverlay(instance) {
  const rubberBandSize = 9;
  const offset = (rubberBandSize - 1) / 2;
  const rbelm = instance.overlay.create('rubber-band', {
    onMouseMove: event => {
      const { y } = event;
      event.target.style.top = `${y - (offset + 0.5)}px`;
      event.target.style.visibility = 'visible';
    },
    onMouseExit: event => {
      event.target.style.visibility = 'hidden';
      if (instance.options.rubberbandExit) {
        instance.options.rubberbandExit({
          source: instance,
        });
      }
    }
  });

  const rb = select(rbelm).classed('rubber-band', true)
    .style('height', `${rubberBandSize}px`)
    .style('background-color', 'rgba(255,0,0,0.1)')
    .style('visibility', 'hidden');

  rb.append('div')
    .style('height', '1px')
    .style('background-color', 'rgba(255,0,0,0.7)')
    .style('position', 'relative')
    .style('top', `${offset}px`);
}

function addReadoutOverlay(instance) {
  const elm = instance.overlay.create('depth', {
    onClick: event => {
      const {
        target,
        caller,
        y,
      } = event;
      const md = caller.scale.invert(y);
      target.textContent = Number.isFinite(md)
        ? `Pinned MD: ${md.toFixed(1)}`
        : '-';
      target.style.visibility = 'visible';
    },
    onMouseMove: event => {
      const {
        target,
        caller,
        y,
      } = event;
      const md = caller.scale.invert(y);
      target.textContent = Number.isFinite(md)
        ? `MD: ${md.toFixed(1)}`
        : '-';
      target.style.visibility = 'visible';
    },
    onMouseExit: event => {
      event.target.style.visibility = 'hidden';
    },
    onRescale: event => {
      event.target.style.visibility = 'visible';
      event.target.textContent = `Zoom: x${event.transform.k.toFixed(1)}`;
    }
  });
  elm.style.visibility = 'hidden';
  elm.style.display = 'inline-block';
  elm.style.padding = '2px';
  elm.style.borderRadius = '4px';
  elm.style.textAlign = 'right';
  elm.style.position = 'absolute';
  elm.style.backgroundColor = 'rgba(0,0,0,0.5)';
  elm.style.color = 'white';
  elm.style.right = '5px';
  elm.style.bottom = '5px';
}

function addPinnedValueOverlay(instance) {
  const rubberBandSize = 9;
  const offset = (rubberBandSize - 1) / 2;
  const rbelm = instance.overlay.create('pinned', {
    onClick: event => {
      const { y } = event;
      event.target.style.top = `${y - (offset + 0.5)}px`;
      event.target.style.visibility = 'visible';
    },
    onMouseExit: event => {
      event.target.style.visibility = 'hidden';
    }
  });

  const rb = select(rbelm).classed('pinned', true)
    .style('height', `${rubberBandSize}px`)
    .style('background-color', 'rgba(0,0,0,0.1)')
    .style('position', 'absolute')
    .style('width', '100%')
    .style('visibility', 'hidden');

  rb.append('div')
    .style('height', '1px')
    .style('background-color', 'rgba(0,255,0,0.7)')
    .style('position', 'relative')
    .style('top', `${offset}px`);
}

interface Props {
    data: any
};

class WellLogView extends Component<Props> {
    container?: HTMLElement;
    logController?: LogViewer;

    constructor(props) {
        super(props)
        //alert("props=" + props)

        this.container = undefined
        this.logController = undefined

        //this.setTracks()
    }

    componentDidMount() {
        this.createLogViewer()
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.data !== prevProps.data) {
            //setState(???)
            //this.setTracks();
            this.createLogViewer() // recreate LogViewer
        }
    }

    createLogViewer() {
        let axes = {
            primary: "md",
            secondary: "tvd"
        }
        const {
            tracks,
            minmaxPrimaryAxis,
            interpolator,
        } = createTracks(this.props.data, axes);

        let scaleHandler = new InterpolatedScaleHandler(interpolator);

        if (this.logController) { // remove old LogViewer
            this.logController.onUnmount(); // 
            this.logController = undefined;
        }
        if (this.container) {
            this.container.innerHTML = ""; // delete all old LogViewer elements

            // create new LogViewer
            this.logController = new LogViewer({
                showLegend: true,
                horizontal: false,
                domain: minmaxPrimaryAxis,
                scaleHandler: scaleHandler
            });

            this.logController.init(this.container);

            addReadoutOverlay(this.logController);
            addRubberbandOverlay(this.logController);
            addPinnedValueOverlay(this.logController);

            //this.setTracks();
            this.logController.setTracks(tracks);
        }
    }

    setTracks() {
        if (!this.logController)
            return;
        let axes = {
            primary: "md",
            secondary: "tvd"
        }

        const {
            tracks,
            minmaxPrimaryAxis,
            interpolator
        } = createTracks(this.props.data, axes);
        //alert(minmaxPrimaryAxis)

        //let scaleHandler = new InterpolatedScaleHandler(interpolator);
        //this.logController.scaleHandler(scaleHandler);// not worked??

        this.logController.domain = minmaxPrimaryAxis;
        this.logController.setTracks(tracks);
    }

    render() {
        return (
            <div>
                <table height='100%' width='100%'>
                    <tr>
                        <td className='wellog' ref={el => { this.container = el as HTMLElement; }} />
                        {/*
                        <td valign='top'>
                            <fieldset>
                                <legend>Scale tracks</legend>
                                <input type='checkbox' checked={true} onChange={function () { return false; }} /> MD<br />
                                <input type='checkbox' /> TVD
                            </fieldset>
                            <fieldset>
                                <legend>Readout</legend>
                                <table width='100' id='well-log-readout'>
                                    <tr><td>MD</td><td>mtr</td><td>2345.6</td></tr>
                                    <tr><td>TVD</td><td>mtr</td><td>1234.5</td></tr>
                                    <tr><td>HKLA</td><td>ohm.m</td><td>110.5</td></tr>
                                    <tr><td>HKLX</td><td></td><td>80.15</td></tr>
                                    <tr><td>...</td></tr>
                                </table>
                            </fieldset>
                        </td>
                        */}
                    </tr>
                </table>
            </div>
        );
    }
}

export default WellLogView
