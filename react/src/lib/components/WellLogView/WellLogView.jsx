import React, { Component } from 'react';
import {
  LogViewer, UIHelper,
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




class WellLogView extends Component {
  componentDidMount() {
    const logController = new LogViewer({
      showLegend: true,
      horizontal: false,
    });
    const tracks = createTracks(true);
this.container.style.height = "96%"
    logController.init(this.container).setTracks(tracks);
this.container.classList.add('wellog');

    addReadoutOverlay(logController);
    addRubberbandOverlay(logController);
    addPinnedValueOverlay(logController);
  }

  render() {
    return (
      <div>
        <div ref={el => { this.container = el; }} />
      </div>
    );
  }
}

export default WellLogView
