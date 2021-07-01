import { range } from 'd3';

import {
  ScaleTrack,
  GraphTrack,
  graphLegendConfig,
  LegendHelper,
  scaleLegendConfig,
} from '@equinor/videx-wellog';

// create random sample data
const domain = [0, 1500];
const ex1 = range(domain[0], domain[1], 10).map(d => [d, Math.random()]);

const ex2 = {
  noise: range(domain[0], domain[1]).map(d => [d, Math.random() * 90]),
  noise2: range(domain[0], domain[1]).map(d => [d, Math.random() * 20])
};

const sin = range(domain[0], domain[1]).map(d => [d, Math.sin((d / 2000) * Math.PI * 2 * 20) * 25 + 50]);
const ex3 = {
  sin,
  noise: sin.map(v => [v[0], v[1] * Math.random() + 35]),
};

// create tracks with sample data
function createTracks(delayLoading = false) {
  const tracks = [
    new ScaleTrack(0, {
      maxWidth: 50,
      width: 2,
      label: 'MD',
      abbr: 'MD',
      units: 'mtr',
      legendConfig: scaleLegendConfig,
    }),
    new GraphTrack(1, {
      legendConfig: LegendHelper.basicVerticalLabel('Some label', 'Abbr'),
      scale: 'log',
      domain: [0.1, 1000],
      label: 'Track A',
      width: 2,
      data: [],
    }),
    new GraphTrack(2, {
      label: 'Pointy',
      abbr: 'Pt',
      data: ex1,
      scale: 'linear',
      domain: [0, 1],
      legendConfig: graphLegendConfig,
      plots: [{
        id: 'dots',
        type: 'dot',
        options: {
          color: 'orange',
          legendInfo: () => ({
            label: 'DOT',
            unit: 'bar',
          }),
        },
      }],
    }),
    new GraphTrack(3, {
      label: 'Some noise',
      abbr: 'noise',
      data: ex2,
      legendConfig: graphLegendConfig,
      plots: [{
        id: 'noise',
        type: 'line',
        options: {
          color: 'blue',
          filterToScale: false,
          dataAccessor: d => d.noise,
          legendInfo: () => ({
            label: 'Plot1',
            unit: 'mm',
          }),
        },
      }, {
        id: 'more_noise',
        type: 'line',
        options: {
          scale: 'linear',
          domain: [0, 40],
          color: 'black',
          offset: 0.5,
          dataAccessor: d => d.noise2,
          legendInfo: () => ({
            label: 'Plot2',
            unit: 'Pwr',
          }),
        },
      }],
    }),
    new GraphTrack(4, {
      label: 'Sinus curve',
      abbr: 'sin',
      data: ex3,
      legendConfig: graphLegendConfig,
      plots: [{
        id: 'noise',
        type: 'area',
        options: {
          legendInfo: () => ({
            label: 'Noise',
            unit: 'Amp',
          }),
          color: 'green',
          inverseColor: 'blue',
          useMinAsBase: false,
          width: 0.5,
          fillOpacity: 0.3,
          dataAccessor: d => d.noise,
        },
      }, {
        id: 'sin',
        type: 'line',
        options: {
          color: 'purple',
          width: 3,
          legendInfo: () => ({
            label: 'SIN',
            unit: 'W',
          }),
          dataAccessor: d => d.sin,
        },
      }],
    }),
  ];

  if (delayLoading) {
    // change data to promise to show loaders
    tracks.forEach(track => {
      if (track.options.data) {
        const delay = 1000 + Math.random() * 1000;
        const data = track.options.data;
        track.options.data = () => new Promise(resolve => setTimeout(() => resolve(data), delay));
      }
    });
  }

  return tracks;
};

export { createTracks, ex1, ex2, ex3 };